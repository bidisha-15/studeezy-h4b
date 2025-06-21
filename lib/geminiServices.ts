import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GEMINI_EMBEDDING_MODEL = "models/embedding-001"

export const getEmbeddings = async (text: string) => {

    const response = await ai.models.embedContent({
        model: GEMINI_EMBEDDING_MODEL,
        contents: text, 
        config: {
            taskType: "SEMANTIC_SIMILARITY",
        }
    });
    // console.log(response)
    return response.embeddings;
}

export const getCompletion = async (prompt: string) => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
          candidateCount: 1,
          temperature: 0,
          maxOutputTokens: 500,
          
        }
      });
    //   console.log(response);
      return response.candidates?.[0]?.content?.parts?.[0]?.text;
}

export const getImageOCR = async (imageUrl:string, prompt:string) => {
  // const imageUrl = "https://goo.gle/instrument-img";

  const response = await fetch(imageUrl);
  const imageArrayBuffer = await response.arrayBuffer();
  const base64ImageData = Buffer.from(imageArrayBuffer).toString('base64');

  const result = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
    {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64ImageData,
      },
    },
    { text: prompt }
  ],
  });
  console.log(result.text);
  return result.text;
}

export const understandDoc = async(docUrl:string) => {
   
    const pdfResp = await fetch(docUrl)
        .then((response) => response.arrayBuffer());

    const contents = [
        { text: "What is written in this document?" },
        {
            inlineData: {
                mimeType: 'application/pdf',
                data: Buffer.from(pdfResp).toString("base64")
            }
        }
    ];

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: contents
    });
    console.log(response.text);
    return response.text;
}