import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb'; 
import { User } from '../../../lib/models/User';

export async function POST(req: Request) {
  try {
    const { username, tier, activationDate, expiryDate } = await req.json();
    
    if (!username || !tier) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();

    // MongoDB me user ko dhundo aur uska subscription plan update kar do
    const updatedUser = await User.findOneAndUpdate(
      { username },
      { 
        subscription: { 
          tier, 
          activationDate, 
          expiryDate 
        } 
      },
      { new: true } // Ye naya updated data return karega
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Plan updated successfully' });
  } catch (error) {
    console.error("🔴 SUBSCRIPTION UPDATE ERROR:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}