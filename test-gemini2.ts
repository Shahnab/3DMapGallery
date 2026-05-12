import { GoogleGenAI } from "@google/genai";
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: 'a simple cat' }] },
    });
    console.log("Success! Parts:", res.candidates?.[0]?.content?.parts?.length);
    for (const part of res.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        console.log("Found img! MimeType:", part.inlineData.mimeType, "Length:", part.inlineData.data.length);
      }
    }
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
