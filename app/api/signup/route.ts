import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/lib/models/User';

export async function POST(req: Request) {
  try {
    const { username, email, phone, password } = await req.json();
    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return NextResponse.json({ error: 'Username or Email already registered.' }, { status: 400 });
    }

    // Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Calculate the 1-Month Free Trial Expiry Date automatically
    const activationDate = new Date();
    const expiryDate = new Date(activationDate);
    expiryDate.setMonth(expiryDate.getMonth() + 1);

    // Save to MongoDB
    await User.create({
      username,
      email,
      phone,
      password: hashedPassword,
      subscription: {
        tier: 'Pro Plan Monthly',
        activationDate,
        expiryDate
      }
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error("🔴 SIGNUP API CRASHED:", error?.message || error);
    return NextResponse.json({ error: error?.message || 'Server error during registration.' }, { status: 500 });
  }
}