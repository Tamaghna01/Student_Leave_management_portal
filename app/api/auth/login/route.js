import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '@/models/userModel';

const signToken = (user) => {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password, role } = body;

    if (!email || !password || !role) {
      return NextResponse.json({
        success: false,
        message: 'Email, password, and role are required.',
      }, { status: 400 });
    }

    if (role !== 'student' && role !== 'faculty') {
      return NextResponse.json({
        success: false,
        message: 'Role must be either student or faculty.',
      }, { status: 400 });
    }

    // Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Invalid email or password.' }, { status: 401 });
    }

    // Verify role matches
    if (user.role !== role) {
      return NextResponse.json({ success: false, message: `Access denied. Incorrect role for this account.` }, { status: 401 });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ success: false, message: 'Invalid email or password.' }, { status: 401 });
    }

    const token = signToken(user);

    return NextResponse.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id:         user.id,
        name:       user.name,
        email:      user.email,
        role:       user.role,
        created_at: user.created_at,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  }
}
