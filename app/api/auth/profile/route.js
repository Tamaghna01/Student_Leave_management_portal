import { NextResponse } from 'next/server';
import { verifyAuth } from '@/middleware/auth';
import UserModel from '@/models/userModel';

export async function GET(req) {
  try {
    const authDecoded = await verifyAuth(req);
    if (authDecoded.error) {
      return NextResponse.json({
        success: false,
        message: authDecoded.error,
      }, { status: authDecoded.status });
    }

    const user = await UserModel.findById(authDecoded.user.id);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found.',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user,
    }, { status: 200 });
  } catch (error) {
    console.error('Profile error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  }
}
