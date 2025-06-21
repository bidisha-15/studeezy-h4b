import { NextResponse } from "next/server";
import * as Tesseract from "tesseract.js";
import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false, // Important to handle file upload
  },
};

export async function POST(req: Request) {
  return new Promise(async (resolve) => {
    const form = new IncomingForm({ uploadDir: "/tmp", keepExtensions: true });

    form.parse(req as any, async (err, fields, files) => {
      if (err) {
        resolve(
          NextResponse.json({ error: "File parsing failed" }, { status: 400 })
        );
        return;
      }

      const file = files.file?.[0] ?? files.file;
      if (!file) {
        resolve(NextResponse.json({ error: "No file uploaded" }, { status: 400 }));
        return;
      }

      try {
        const filePath = file.filepath || file.path;
        const result = await Tesseract.recognize(filePath, "eng");

        // Optional: Delete temp file
        fs.unlinkSync(filePath);

        resolve(NextResponse.json({ text: result.data.text }));
      } catch (error) {
        console.error("OCR error:", error);
        resolve(
          NextResponse.json({ error: "OCR processing failed" }, { status: 500 })
        );
      }
    });
  });
}
