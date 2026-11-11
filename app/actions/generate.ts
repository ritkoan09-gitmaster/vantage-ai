'use server';

import { GoogleGenAI } from '@google/genai';

export async function generateSnippetMetadata(rawCode: string) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing from your environment variables.");
    }

    // Initialize the modern SDK
    const ai = new GoogleGenAI({ apiKey: apiKey });

    const sanitizedCode = rawCode.substring(0, 3000);

    const prompt = `
      Analyze the provided code and return ONLY a strict JSON object.
      No markdown, no explanation, no extra text.
      JSON Schema:
      {
        "language": "string",
        "title": "string (max 50 chars)",
        "description": "string (max 150 chars)",
        "tags": ["tag1", "tag2", "tag3"]
      }
      
      Code:
      ${sanitizedCode}
    `;

    // Modern generation execution using the new SDK methods
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    
    // The new SDK returns text directly on the response object
    const text = response.text;
    
    if (!text) {
      throw new Error("Neural Engine returned an empty response.");
    }

    // Boundary scanning to isolate valid structural braces
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    
    if (startIndex === -1 || endIndex === -1) {
      throw new Error("Neural Engine failed to return a valid JSON map architecture.");
    }
    
    const cleanJson = text.substring(startIndex, endIndex + 1);
    return JSON.parse(cleanJson);
    
  } catch (error: any) {
    console.error("Neural Engine Error Details:", error);
    // Safely transmits the message back to your frontend UI alert
    throw new Error(error.message || "Failed to process code through Neural Engine.");
  }
}