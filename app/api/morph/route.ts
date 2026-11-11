import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { code, targetLanguage, currentLanguage } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'API Key missing in .env.local' }, { status: 500 });
    }

    const prompt = `You are an expert compiler and polyglot code translator. Convert the following ${currentLanguage} code into pure ${targetLanguage}. CRITICAL RULE: Return ONLY the raw executable code inside the response text. DO NOT include any markdown block ticks like \`\`\`. Here is the code: \n\n${code}`;

    // ✅ THE REAL FIX: AQ. keys strictly require gemini-2.5-flash on v1beta
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Gemini Details:", data);
      return NextResponse.json({ error: data?.error?.message || 'Google AI rejected the request.' }, { status: response.status });
    }

    if (!data.candidates || data.candidates.length === 0) {
      return NextResponse.json({ error: 'Google AI blocked the response due to safety.' }, { status: 500 });
    }

    let translatedCode = data.candidates[0].content.parts[0].text.trim();
    
    // Cleanup markdown ticks if AI adds them
    translatedCode = translatedCode.replace(/^```[a-z]*\n/i, '').replace(/\n```$/, '').trim();

    return NextResponse.json({ success: true, translatedCode });
    
  } catch (error: any) {
    console.error("🔴 MORPH CRASH:", error);
    return NextResponse.json({ error: error.message || 'Server Crashed' }, { status: 500 });
  }
}