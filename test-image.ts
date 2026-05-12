import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";
dotenv.config();

async function check() {
  const ai = new GoogleGenAI({});
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: { parts: [{text: 'a small dog'}] }
    });
    console.log("Success! Extracted parts:", res.candidates?.[0]?.content?.parts?.length);
  } catch (e) {
    console.error("error!", e);
  }
}
check();
