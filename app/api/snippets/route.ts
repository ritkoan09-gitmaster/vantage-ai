import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import { Snippet } from '../../../lib/models/Snippet';

// GET: User ke saare snippets fetch karne ke liye
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const username = url.searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    await connectToDatabase();
    
    // Naye snippets pehle dikhenge - .lean() for maximum speed
    const snippets = await Snippet.find({ username }).sort({ createdAt: -1 }).lean();

    return NextResponse.json(
      { success: true, snippets },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error) {
    console.error("🔴 GET SNIPPETS ERROR:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Naya snippet save karne ke liye
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, snippet } = body;

    if (!username || !snippet) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    await connectToDatabase();

    const newSnippet = await Snippet.create({
      snippetId: snippet.id,
      username: username,
      title: snippet.title,
      description: snippet.description,
      language: snippet.language,
      code: snippet.code,
      tags: snippet.tags,
      starred: snippet.starred || false,
      copies: snippet.copies || 0,
      views: snippet.views || 0,
      xray: snippet.xray || null
    });

    return NextResponse.json({ success: true, newSnippet, snippet: newSnippet });
  } catch (error) {
    console.error("🔴 POST SNIPPET ERROR:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT: Snippet ko Edit ya Star karne ke liye
export async function PUT(req: Request) {
  try {
    const { username, snippet } = await req.json();
    if (!username || !snippet || !snippet.id) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    await connectToDatabase();

    // ✅ BUG FIXED: Added copies and views to $set so MongoDB saves the new numbers!
    const updatedSnippet = await Snippet.findOneAndUpdate(
      { snippetId: snippet.id, username: username },
      { 
        $set: { 
          title: snippet.title,
          description: snippet.description,
          language: snippet.language,
          code: snippet.code,
          tags: snippet.tags,
          starred: snippet.starred,
          xray: snippet.xray,
          copies: snippet.copies, // 👈 Ye missing tha
          views: snippet.views    // 👈 Ye missing tha
        } 
      },
      { new: true }
    );

    return NextResponse.json({ success: true, snippet: updatedSnippet });
  } catch (error) {
    console.error("🔴 PUT SNIPPET ERROR:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Snippet ko hamesha ke liye Delete karne ke liye
export async function DELETE(req: Request) {
  try {
    const { username, snippetId } = await req.json();
    if (!username || !snippetId) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    await connectToDatabase();
    
    // Database se hamesha ke liye uda do
    await Snippet.findOneAndDelete({ snippetId, username });

    return NextResponse.json({ success: true, message: 'Snippet deleted' });
  } catch (error) {
    console.error("🔴 DELETE SNIPPET ERROR:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}