import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { code, language } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'API Key missing in .env.local' }, { status: 500 });
    }

    // 🧠 AI ko strict order dene ke liye Prompt Engineering
    const prompt = `You are an elite level senior software engineer. Analyze the following ${language} code.
    You MUST return ONLY a valid, raw JSON object. Do not include any markdown formatting like \`\`\`json.
    If there are no bugs, leave the bugs array empty. Keep explanations very short.
    
    The JSON MUST strictly follow this exact structure:
    {
      "timeComplexity": "O(...)",
      "spaceComplexity": "O(...)",
      "score": <number between 0 and 100 representing code quality>,
      "bugs": ["bug description 1", "bug description 2"],
      "improvements": ["improvement tip 1", "improvement tip 2"]
    }

    Here is the code to analyze:
    \n\n${code}`;

    // Naya 2.5-flash model jo teri AQ. key ke sath chalega
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("X-Ray API Error:", data);
      return NextResponse.json({ error: data?.error?.message || 'AI rejected request' }, { status: response.status });
    }

    let aiResponseText = data.candidates[0].content.parts[0].text.trim();
    
    // Safety check: Agar AI zidd karke ```json laga de, toh use hata do
    aiResponseText = aiResponseText.replace(/^```json\n/i, '').replace(/^```\n/i, '').replace(/\n```$/, '').trim();

    // AI ke text ko asli JavaScript Object mein convert karo
    const xrayDiagnostics = JSON.parse(aiResponseText);

    return NextResponse.json({ success: true, xray: xrayDiagnostics });
    
  } catch (error: any) {
    console.error("🔴 X-RAY CRASH:", error);
    return NextResponse.json({ error: 'Failed to analyze code. The AI might have returned invalid JSON.' }, { status: 500 });
  }
}