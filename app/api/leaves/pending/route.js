import { NextResponse } from 'next/server';
import { verifyAuth } from '@/middleware/auth';
import { verifyRole } from '@/middleware/role';
import LeaveModel from '@/models/leaveModel';

export async function GET(req) {
  try {
    const authDecoded = await verifyAuth(req);
    if (authDecoded.error) {
      return NextResponse.json({ success: false, message: authDecoded.error }, { status: authDecoded.status });
    }

    const roleError = verifyRole(authDecoded.user, 'faculty');
    if (roleError) {
      return NextResponse.json({ success: false, message: roleError.error }, { status: roleError.status });
    }

    const leaves = await LeaveModel.findAllPending();
    return NextResponse.json({ success: true, leaves }, { status: 200 });
  } catch (error) {
    console.error('Get pending leaves error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  }
}
