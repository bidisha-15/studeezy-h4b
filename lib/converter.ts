let worker: any = null;

export const converter = async (file: File) => {
  const reader = new FileReader();

  return new Promise<string>((resolve, reject) => {
    reader.onload = async () => {
      try {
        if (!worker) {
          const { createWorker } = await import('tesseract.js');

          worker = await createWorker();
          console.log('⚙️ Loading Tesseract...');
          await worker.load();
          console.log('📖 Loading language...');
          await worker.loadLanguage('eng');
          console.log('🚀 Initializing...');
          await worker.initialize('eng');
        }

        console.log('🖼️ Starting OCR...');
        const { data } = await worker.recognize(reader.result as string);
        console.log('✅ OCR Completed');

        resolve(data.text);
      } catch (err) {
        console.error('❌ OCR Error:', err);
        reject(err);
      }
    };

    reader.onerror = (err) => {
      console.error('❌ File Read Error:', err);
      reject(err);
    };

    console.log('📂 Reading file as Base64...');
    reader.readAsDataURL(file);
  });
};
