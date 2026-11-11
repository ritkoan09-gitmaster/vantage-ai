import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Gemini API Call to generate structured snippet
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an expert developer. Create a high-quality code snippet based on this voice command: "${prompt}". 
            You MUST return ONLY a clean JSON object with no markdown formatting or backticks. The JSON structure must be exactly:
            {
              "title": "Short descriptive title",
              "language": "Exact language name like JavaScript, Python, TypeScript, SQL, HTML, CSS",
              "code": "The actual full functional code string",
              "description": "Brief explanation of what the code does",
              "tags": ["tag1", "tag2", "tag3"]
            }`
          }]
        }]
      })
    });

    const data = await response.json();
    const rawText = data.candidates[0].content.parts[0].text.trim();
    
    // Clean any accidental markdown code blocks
    const cleanJsonText = rawText.replace(/^```(json)?/, '').replace(/```$/, '').trim();
    const snippetData = JSON.parse(cleanJsonText);

    return NextResponse.json({ success: true, snippet: snippetData });
  } catch (error: any) {
    console.error("🔴 JARVIS API ERROR:", error);
    return NextResponse.json({ error: 'Failed to synthesize code sequence' }, { status: 500 });
  }
}