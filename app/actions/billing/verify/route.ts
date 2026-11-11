import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/lib/models/User';

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, username, tier, newExpiryIso } = await req.json();

    // Step 1: Verify the cryptographic signature from Razorpay
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature detected.' }, { status: 400 });
    }

    // Step 2: If payment is valid, update the user's subscription in MongoDB
    await connectToDatabase();
    await User.findOneAndUpdate(
      { username },
      { 
        'subscription.tier': tier,
        'subscription.activationDate': new Date(),
        'subscription.expiryDate': new Date(newExpiryIso)
      }
    );

    return NextResponse.json({ success: true, message: 'Payment verified and Vault updated.' }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Server error during payment verification.' }, { status: 500 });
  }
}