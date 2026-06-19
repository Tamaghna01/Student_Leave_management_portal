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
    const { name, email, password, role } = body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json({
        success: false,
        message: 'Name, email, password, and role are required.',
      }, { status: 400 });
    }

    // Validate role (Public registration is for students only)
    if (role !== 'student') {
      return NextResponse.json({
        success: false,
        message: 'Faculty accounts cannot be created via public registration. Please contact the administrator.',
      }, { status: 403 });
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

    // Find if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'An account with this email already exists.',
      }, { status: 409 });
    }

    // Hash the password
    const salt         = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Student registers by creating a new account
    const userResult = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      role: 'student',
    });

    const token = signToken(userResult);

    return NextResponse.json({
      success: true,
      message: 'Registration successful.',
      token,
      user: {
        id:         userResult.id,
        name:       userResult.name,
        email:      userResult.email,
        role:       userResult.role,
        created_at: userResult.created_at,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  }
}
