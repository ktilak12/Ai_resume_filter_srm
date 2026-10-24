import { describe, it, expect } from 'vitest';
import { validateResumeFile, extractResumesFromZip } from '../services/resumeParser';
import JSZip from 'jszip';

describe('Resume Parser Security & Extraction', () => {
  it('rejects empty 0-byte files', async () => {
    const emptyFile = new File([], 'resume.pdf', { type: 'application/pdf' });
    await expect(validateResumeFile(emptyFile)).rejects.toThrow('Uploaded file is empty');
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
});
