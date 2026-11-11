import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const { amount, tier } = await req.json();

    // Razorpay expects amount in the smallest currency unit (paise for INR, cents for USD)
    // E.g., If price is $9 (900 cents) or ₹999 (99900 paise)
    const options = {
      amount: amount * 100, 
      currency: "USD", // Change to "INR" if your app targets India natively
      receipt: `receipt_${Date.now()}`,
      notes: { tier }
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json({ success: true, order }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to initialize payment pipeline.' }, { status: 500 });
  }
}