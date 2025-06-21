import { createWorker } from 'tesseract.js';
import pdfParse from 'pdf-parse';

// For OCR of image buffers (jpg, png, etc.)
export async function performOCR(buffer: Buffer): Promise<string> {
  if (!buffer || buffer.length === 0) throw new Error('Empty buffer');

  const worker = await createWorker({
    logger: m => console.log(m),
    errorHandler: err => console.error(err),
  });

  try {
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const {
      data: { text },
    } = await worker.recognize(buffer);

    if (!text || text.trim().length === 0) {
      throw new Error('No text extracted from image');
    }

    return text;
  } finally {
    await worker.terminate();
  }
}


import Tesseract from 'tesseract.js';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export async function extractTextFromFile(fileUrl: string): Promise<string | null> {
  try {
    console.log('[OCR_UTIL] Downloading file...');
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data);

    const tempDir = os.tmpdir(); // Cross-platform /tmp
    const tempPath = path.join(tempDir, `ocr-${Date.now()}.png`);

    console.log('[OCR_UTIL] Saving to temporary file...');
    await fs.writeFile(tempPath, imageBuffer);

    console.log('[OCR_UTIL] Starting OCR...');
    const result = await Tesseract.recognize(tempPath, 'eng', {
      corePath: require.resolve('tesseract.js-core/tesseract-core.wasm.js'),
      logger: (m) => console.log(m)
    });
    

    console.log('[OCR_UTIL] OCR done. Cleaning up...');
    await fs.unlink(tempPath);

    return result.data.text;
  } catch (error) {
    console.error('[OCR_UTIL_ERROR]', error);
    return null;
  }
}