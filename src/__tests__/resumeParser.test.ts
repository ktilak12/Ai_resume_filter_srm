import { describe, it, expect } from 'vitest';
import { validateResumeFile, extractResumesFromZip, sanitizeTextContent, parseResumeFile } from '../services/resumeParser';
import JSZip from 'jszip';

describe('Resume Parser Security & Extraction', () => {
  it('rejects empty 0-byte files', async () => {
    const emptyFile = new File([], 'resume.pdf', { type: 'application/pdf' });
    await expect(validateResumeFile(emptyFile)).rejects.toThrow('Uploaded file is empty');
  });

  it('rejects files exceeding the 10MB maximum institutional limit', async () => {
    const oversizedBlob = new Blob([new Uint8Array(11 * 1024 * 1024)]);
    const oversizedFile = new File([oversizedBlob], 'huge_resume.pdf', { type: 'application/pdf' });
    await expect(validateResumeFile(oversizedFile)).rejects.toThrow('exceeds maximum institutional limit of 10MB');
  });

  it('rejects unsupported executable extensions', async () => {
    const fakeExe = new File(['echo malicious'], 'script.sh', { type: 'text/x-sh' });
    await expect(validateResumeFile(fakeExe)).rejects.toThrow('Unsupported file type');
  });

  it('detects spoofed PDF headers', async () => {
    const spoofedPdf = new File(['NOT_A_PDF_HEADER_DATA'], 'resume.pdf', { type: 'application/pdf' });
    await expect(validateResumeFile(spoofedPdf)).rejects.toThrow('lacks valid PDF signature');
  });

  it('passes validation for valid PDF signature header', async () => {
    const validPdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]); // %PDF-1.4
    const validPdf = new File([validPdfBytes], 'valid_resume.pdf', { type: 'application/pdf' });
    await expect(validateResumeFile(validPdf)).resolves.toBeUndefined();
  });

  it('validates OpenXML / DOCX ZIP header', async () => {
    const validDocxBytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04]); // PK
    const validDocx = new File([validDocxBytes], 'valid_doc.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    await expect(validateResumeFile(validDocx)).resolves.toBeUndefined();

    const fakeDocx = new File(['PLAIN_TEXT_NOT_DOCX'], 'fake_doc.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    await expect(validateResumeFile(fakeDocx)).rejects.toThrow('lacks valid OpenXML/ZIP header');
  });

  it('neutralizes Zip-Slip directory traversal attempts in ZIP archives', async () => {
    const zip = new JSZip();
    // Attempt zip slip path traversal
    zip.file('..\\windows\\system32\\trojan.pdf', new Uint8Array([0x25, 0x50, 0x44, 0x46]));
    zip.file('safe_resume.pdf', new Uint8Array([0x25, 0x50, 0x44, 0x46]));

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipFile = new File([zipBlob], 'slip_archive.zip', { type: 'application/zip' });

    const extracted = await extractResumesFromZip(zipFile);
    // Path traversal files must be dropped
    expect(extracted.length).toBe(1);
    expect(extracted[0].name).toBe('safe_resume.pdf');
  });

  it('extracts allowed resumes from ZIP archives while filtering non-resume files', async () => {
    const zip = new JSZip();
    zip.file('candidate1.pdf', new Uint8Array([0x25, 0x50, 0x44, 0x46]));
    zip.file('resumes/candidate2.txt', 'SRM Student Resume details');
    zip.file('nested/folder/candidate3.docx', 'PK DOCX contents');
    zip.file('ignored_file.png', 'PNG image data');
    zip.file('notes.json', '{"ignored": true}');

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipFile = new File([zipBlob], 'candidates_batch.zip', { type: 'application/zip' });

    const extracted = await extractResumesFromZip(zipFile);
    expect(extracted.length).toBe(3);
    expect(extracted.some(f => f.name === 'candidate1.pdf')).toBe(true);
    expect(extracted.some(f => f.name === 'candidate2.txt')).toBe(true);
    expect(extracted.some(f => f.name === 'candidate3.docx')).toBe(true);
    expect(extracted.some(f => f.name.endsWith('.png'))).toBe(false);
  });

  it('strips malicious script and style tags while preventing ReDoS', () => {
    const maliciousHtml = 'Hello <script>alert("pwned")</script> World <style>body{color:red;}</style> test';
    expect(sanitizeTextContent(maliciousHtml)).toBe('Hello  World  test');

    // ReDoS resistance test with nested unclosed brackets
    const unclosedHostile = '<script<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<';
    const start = Date.now();
    const result = sanitizeTextContent(unclosedHostile);
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100); // Must execute linearly in <100ms
    expect(result).toBe('');
  });
});
