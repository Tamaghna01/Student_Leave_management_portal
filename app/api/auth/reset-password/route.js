import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import UserModel from '@/models/userModel';

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Email and new password are required.',
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, message: 'Invalid email format.' }, { status: 400 });
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        message: 'Password must be at least 6 characters.',
      }, { status: 400 });
    }

    // Check if user exists
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'No account with this email address was found.',
      }, { status: 404 });
    }

    // Hash the new password
    const salt         = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update the user's password
    await UserModel.update(user.id, { password: hashedPassword });

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in.',
    }, { status: 200 });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  }
}
