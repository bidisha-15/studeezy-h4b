'use client';

import { useState } from 'react';
import { createWorker, LoggerMessage } from 'tesseract.js';

const OcrReader = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [ocrResult, setOcrResult] = useState('');
  const [ocrStatus, setOcrStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      setSelectedImage(event.target.files[0]);
      setOcrResult('');
      setOcrStatus('');
      setProgress(0);
    }
  };

  const readImageText = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setOcrStatus('Initializing...');
    const worker = await createWorker({
      logger: (m: LoggerMessage) => {
        if (m.status === 'recognizing text') {
          setProgress(Math.round(m.progress * 100));
          setOcrStatus(`Recognizing... ${Math.round(m.progress * 100)}%`);
        } else {
          setOcrStatus(m.status);
        }
      }
    });

    try {
      await worker.load();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');

      const {
        data: { text }
      } = await worker.recognize(selectedImage);

      setOcrResult(text);
      setOcrStatus('Completed');
    } catch (error) {
      console.error(error);
      setOcrStatus('Error occurred during processing.');
    } finally {
      await worker.terminate();
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow-md space-y-4 mt-8">
      <h2 className="text-xl font-bold text-center">OCR Reader (Tesseract.js)</h2>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0
                   file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-blue-700
                   hover:file:bg-blue-100"
      />

      {selectedImage && (
        <div className="flex justify-center">
          <img
            src={URL.createObjectURL(selectedImage)}
            alt="Uploaded content"
            className="mt-4 rounded-lg shadow max-w-xs"
          />
        </div>
      )}

      <button
        onClick={readImageText}
        disabled={loading || !selectedImage}
        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Start OCR'}
      </button>

      {ocrStatus && (
        <div className="text-center text-sm text-gray-700 mt-2">
          Status: {ocrStatus}
        </div>
      )}

      {progress > 0 && progress < 100 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-500 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {ocrResult && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-bold mb-2">Extracted Text:</h3>
          <p className="whitespace-pre-wrap">{ocrResult}</p>
        </div>
      )}
    </div>
  );
};

export default OcrReader;