import os
import re
import subprocess
import pymupdf
from markdown_it import MarkdownIt

def build_pdf():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    md_path = os.path.join(root_dir, 'PROJECT_DOCUMENTATION.md')
    temp_html_path = os.path.join(root_dir, 'temp_doc_render.html')
    temp_raw_pdf_path = os.path.join(root_dir, 'temp_doc_raw.pdf')
    final_pdf_path = os.path.join(root_dir, 'PROJECT_DOCUMENTATION.pdf')

    print(f"Reading markdown from {md_path}...")
    with open(md_path, 'r', encoding='utf-8') as f:
        md_text = f.read()

    # Pre-process LaTeX and formulas for crisp, deterministic HTML/CSS display
    formula_regex = r'\$\$\\text\{Final ATS Score\}\s*=\s*(.*?)\$\$'
    def formula_sub(match):
        raw_formula = match.group(1)
        formatted = (raw_formula
            .replace('(S \\times W_s)', '(<i>S</i> &times; <i>W</i><sub>s</sub>)')
            .replace('(E \\times W_e)', '(<i>E</i> &times; <i>W</i><sub>e</sub>)')
            .replace('(A \\times W_a)', '(<i>A</i> &times; <i>W</i><sub>a</sub>)')
            .replace('(P \\times W_p)', '(<i>P</i> &times; <i>W</i><sub>p</sub>)')
            .replace('(C \\times W_c)', '(<i>C</i> &times; <i>W</i><sub>c</sub>)')
            .replace('D_{\\text{format}}', '<i>D</i><sub>format</sub>')
            .replace('-', '&minus;')
            .replace('+', '&plus;')
        )
        return f'''<div class="math-card">
  <div class="math-badge">ATS Deterministic Scoring Algorithm</div>
  <div class="formula-line"><strong>Final ATS Score</strong> = {formatted}</div>
</div>'''
    
    processed_md = re.sub(formula_regex, formula_sub, md_text, flags=re.DOTALL)

    # Inline math cleanups
    processed_md = processed_md.replace('($S$)', '(<i>S</i>)')
    processed_md = processed_md.replace('($W_s$)', '(<i>W</i><sub>s</sub>)')
    processed_md = processed_md.replace('($E$)', '(<i>E</i>)')
    processed_md = processed_md.replace('($W_e$)', '(<i>W</i><sub>e</sub>)')
    processed_md = processed_md.replace('($A$)', '(<i>A</i>)')
    processed_md = processed_md.replace('($W_a$)', '(<i>W</i><sub>a</sub>)')
    processed_md = processed_md.replace('($P$)', '(<i>P</i>)')
    processed_md = processed_md.replace('($W_p$)', '(<i>W</i><sub>p</sub>)')
    processed_md = processed_md.replace('($C$)', '(<i>C</i>)')
    processed_md = processed_md.replace('($W_c$)', '(<i>W</i><sub>c</sub>)')
    processed_md = processed_md.replace('($\\ge 85\\%$)', '(<strong>&ge; 85%</strong>)')
    processed_md = processed_md.replace('($65\\% - 84\\%$)', '(<strong>65% &ndash; 84%</strong>)')
    processed_md = processed_md.replace('($< 65\\%$)', '(<strong>&lt; 65%</strong>)')
    processed_md = processed_md.replace('$\\to$', '&rarr;')

    # Insert page breaks so each page is purposeful and balanced
    page_break_targets = [
        '## 2. Complete Technology Stack',
        '## 4. Security & Privacy Engineering',
        '## 5. ATS AI Screening & Evaluation Engine',
        '## 6. Complete Directory & File Structure Reference',
        '### Components (`src/components/`)',
        '### Automated Test Suites (`src/__tests__/`)',
        '## 8. Automated Quality Assurance Verification Results'
    ]

    for target in page_break_targets:
        if target in processed_md:
            processed_md = processed_md.replace(target, f'<div class="page-break"></div>\n\n{target}')

    # Render Markdown to HTML using MarkdownIt
    md_parser = MarkdownIt().enable('table').enable('strikethrough')
    rendered_body = md_parser.render(processed_md)

    # Wrap Table of Contents in a 2-column container so it's compact on Page 1
    # Match <ol> following <h2>Table of Contents</h2>
    toc_pattern = r'(<h2>Table of Contents</h2>\s*)(<ol>.*?</ol>)'
    def toc_repl(m):
        return f'{m.group(1)}<div class="toc-container">{m.group(2)}</div>'
    rendered_body = re.sub(toc_pattern, toc_repl, rendered_body, flags=re.DOTALL)

    # Wrap in executive HTML template
    full_html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>SRM ResumeAI — Master Project Documentation & Technical Specification</title>
<style>
  @page {{
    size: A4;
    margin: 16mm 14mm 16mm 14mm;
  }}

  * {{
    box-sizing: border-box;
  }}

  body {{
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #1e293b;
    background-color: #ffffff;
    font-size: 8.8pt;
    line-height: 1.48;
    margin: 0;
    padding: 0;
  }}

  .page-break {{
    page-break-before: always;
    break-before: page;
  }}

  /* Institutional Header Banner */
  .institution-banner {{
    background: linear-gradient(135deg, #090d16 0%, #0f172a 100%);
    color: #ffffff;
    padding: 14px 18px;
    border-radius: 6px;
    margin-bottom: 14px;
    border: 1px solid #1e293b;
    border-top: 3.5px solid #2563eb;
  }}

  .institution-header-row {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    padding-bottom: 8px;
    margin-bottom: 8px;
  }}

  .institution-title {{
    font-size: 12pt;
    font-weight: 800;
    letter-spacing: 0.8px;
    color: #f8fafc;
    text-transform: uppercase;
  }}

  .institution-sub {{
    font-size: 8pt;
    color: #94a3b8;
    margin-top: 2px;
  }}

  .meta-tag {{
    display: inline-block;
    background: rgba(37, 99, 235, 0.25);
    color: #60a5fa;
    border: 1px solid rgba(96, 165, 250, 0.4);
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 7pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }}

  .meta-grid {{
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    font-size: 7.5pt;
  }}

  .meta-item-label {{
    color: #64748b;
    font-size: 6.5pt;
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.4px;
  }}

  .meta-item-val {{
    color: #e2e8f0;
    font-weight: 600;
    margin-top: 1px;
  }}

  /* Typography */
  h1 {{
    font-size: 15pt;
    font-weight: 800;
    color: #0f172a;
    margin-top: 0;
    margin-bottom: 6px;
    line-height: 1.25;
  }}

  h2 {{
    font-size: 11pt;
    font-weight: 700;
    color: #0f172a;
    border-left: 3.5px solid #2563eb;
    padding-left: 8px;
    margin-top: 14px;
    margin-bottom: 8px;
    page-break-after: avoid;
    break-after: avoid;
  }}

  h3 {{
    font-size: 9.5pt;
    font-weight: 700;
    color: #1e293b;
    margin-top: 10px;
    margin-bottom: 4px;
    page-break-after: avoid;
    break-after: avoid;
  }}

  p {{
    margin-top: 2px;
    margin-bottom: 6px;
  }}

  ul, ol {{
    margin-top: 2px;
    margin-bottom: 6px;
    padding-left: 16px;
  }}

  li {{
    margin-bottom: 2.5px;
  }}

  .toc-container ol {{
    column-count: 2;
    column-gap: 24px;
    margin: 4px 0 10px 0;
    padding-left: 18px;
  }}

  .toc-container li {{
    font-size: 8pt;
    font-weight: 600;
    margin-bottom: 3px;
  }}

  hr {{
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 12px 0;
  }}

  strong {{
    color: #0f172a;
    font-weight: 650;
  }}

  /* Tables */
  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0 12px 0;
    font-size: 7.8pt;
    page-break-inside: avoid;
    break-inside: avoid;
  }}

  th, td {{
    border: 1px solid #cbd5e1;
    padding: 5px 8px;
    text-align: left;
    vertical-align: top;
  }}

  th {{
    background-color: #f1f5f9;
    color: #0f172a;
    font-weight: 700;
    border-bottom: 2px solid #94a3b8;
    text-transform: uppercase;
    font-size: 7pt;
    letter-spacing: 0.5px;
  }}

  tr:nth-child(even) {{
    background-color: #f8fafc;
  }}

  tr {{
    page-break-inside: avoid;
    break-inside: avoid;
  }}

  /* Code & Monospace */
  pre {{
    background: #090d16;
    color: #e2e8f0;
    border: 1px solid #1e293b;
    border-radius: 5px;
    padding: 9px 12px;
    font-family: "Consolas", "Courier New", monospace;
    font-size: 7.2pt;
    line-height: 1.38;
    overflow-x: auto;
    page-break-inside: avoid;
    break-inside: avoid;
    margin: 6px 0 10px 0;
    white-space: pre;
  }}

  code {{
    font-family: "Consolas", "Courier New", monospace;
    font-size: 7.2pt;
    background-color: #f1f5f9;
    color: #0f172a;
    padding: 1px 3.5px;
    border-radius: 3px;
    border: 1px solid #e2e8f0;
  }}

  pre code {{
    background: transparent;
    color: inherit;
    padding: 0;
    border: none;
  }}

  /* Math Card */
  .math-card {{
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-left: 3.5px solid #2563eb;
    border-radius: 5px;
    padding: 9px 13px;
    margin: 10px 0;
    page-break-inside: avoid;
    break-inside: avoid;
  }}

  .math-badge {{
    font-size: 6.8pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: #2563eb;
    margin-bottom: 2px;
  }}

  .formula-line {{
    font-size: 9.8pt;
    color: #0f172a;
    font-family: Georgia, "Times New Roman", serif;
  }}

  /* Callouts & Quotes */
  blockquote {{
    border-left: 3px solid #cbd5e1;
    margin: 6px 0;
    padding: 4px 10px;
    color: #475569;
    background: #f8fafc;
    page-break-inside: avoid;
    break-inside: avoid;
  }}

  a {{
    color: #2563eb;
    text-decoration: none;
  }}
</style>
</head>
<body>

<div class="institution-banner">
  <div class="institution-header-row">
    <div>
      <div class="institution-title">SRM Institute of Science and Technology</div>
      <div class="institution-sub">Directorate of Career Centre &amp; Campus Placement Services &bull; Kattankulathur, Chennai</div>
    </div>
    <div>
      <span class="meta-tag">Master Specification</span>
    </div>
  </div>
  <div class="meta-grid">
    <div>
      <div class="meta-item-label">System</div>
      <div class="meta-item-val">SRM ResumeAI v1.0.0</div>
    </div>
    <div>
      <div class="meta-item-label">Security Tier</div>
      <div class="meta-item-val">Institutional Production</div>
    </div>
    <div>
      <div class="meta-item-label">Database Security</div>
      <div class="meta-item-val">AES-GCM 256-Bit Encrypted</div>
    </div>
    <div>
      <div class="meta-item-label">Automated QA</div>
      <div class="meta-item-val">78 / 78 Passing (100%)</div>
    </div>
  </div>
</div>

{rendered_body}

</body>
</html>'''

    print(f"Writing rendered HTML to {temp_html_path}...")
    with open(temp_html_path, 'w', encoding='utf-8') as f:
        f.write(full_html)

    edge_bin = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    if not os.path.exists(edge_bin):
        edge_bin = r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"
    
    print("Executing headless browser print engine...")
    cmd = [
        edge_bin,
        '--headless',
        '--disable-gpu',
        '--no-pdf-header-footer',
        '--run-all-compositor-stages-before-draw',
        f'--print-to-pdf={temp_raw_pdf_path}',
        f'file:///{temp_html_path}'
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"Edge print-to-pdf failed: {res.stderr}")

    print("Stamping institutional running headers, footers, and page numbers with PyMuPDF...")
    doc = pymupdf.open(temp_raw_pdf_path)
    total_pages = len(doc)
    print(f"Generated raw document with {total_pages} pages.")

    subtle_color = (0.45, 0.50, 0.58)
    line_color = (0.85, 0.88, 0.92)

    for idx, page in enumerate(doc):
        page_num = idx + 1
        rect = page.rect

        # Running header (pages 2 and above)
        if page_num > 1:
            header_rect = pymupdf.Rect(page.rect.x0 + 40, page.rect.y0 + 15, page.rect.x1 - 40, page.rect.y0 + 32)
            page.insert_textbox(
                header_rect,
                "SRMIST Directorate of Career Centre  |  SRM ResumeAI Master Specification",
                fontsize=7.5,
                fontname="helv",
                color=subtle_color,
                align=pymupdf.TEXT_ALIGN_LEFT
            )
            # Header line
            page.draw_line(
                pymupdf.Point(page.rect.x0 + 40, page.rect.y0 + 32),
                pymupdf.Point(page.rect.x1 - 40, page.rect.y0 + 32),
                color=line_color,
                width=0.5
            )

        # Running footer (all pages)
        # Footer line
        page.draw_line(
            pymupdf.Point(page.rect.x0 + 40, page.rect.y1 - 32),
            pymupdf.Point(page.rect.x1 - 40, page.rect.y1 - 32),
            color=line_color,
            width=0.5
        )

        # Footer text left
        footer_left_rect = pymupdf.Rect(page.rect.x0 + 40, page.rect.y1 - 28, page.rect.x1 - 120, page.rect.y1 - 14)
        page.insert_textbox(
            footer_left_rect,
            "SRM Institute of Science and Technology  |  Directorate of Career Centre  |  DPDP Act 2023 Compliant",
            fontsize=7.5,
            fontname="helv",
            color=subtle_color,
            align=pymupdf.TEXT_ALIGN_LEFT
        )

        # Footer text right (Page X of Y)
        footer_right_rect = pymupdf.Rect(page.rect.x1 - 110, page.rect.y1 - 28, page.rect.x1 - 40, page.rect.y1 - 14)
        page.insert_textbox(
            footer_right_rect,
            f"Page {page_num} of {total_pages}",
            fontsize=7.5,
            fontname="helv",
            color=subtle_color,
            align=pymupdf.TEXT_ALIGN_RIGHT
        )

    doc.save(final_pdf_path)
    doc.close()

    # Clean up temporary files
    if os.path.exists(temp_html_path):
        os.remove(temp_html_path)
    if os.path.exists(temp_raw_pdf_path):
        os.remove(temp_raw_pdf_path)

    pdf_size_kb = os.path.getsize(final_pdf_path) / 1024
    print(f"SUCCESS: Generated PDF at {final_pdf_path} ({pdf_size_kb:.1f} KB, {total_pages} pages).")

if __name__ == '__main__':
    build_pdf()
