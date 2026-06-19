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

    const roleError = verifyRole(authDecoded.user, 'student');
    if (roleError) {
      return NextResponse.json({ success: false, message: roleError.error }, { status: roleError.status });
    }

    const leaves = await LeaveModel.findByStudentId(authDecoded.user.id);
    const stats  = await LeaveModel.getStatsByStudentId(authDecoded.user.id);

    return NextResponse.json({
      success: true,
      stats: {
        total:    parseInt(stats.total || 0),
        pending:  parseInt(stats.pending || 0),
        approved: parseInt(stats.approved || 0),
        rejected: parseInt(stats.rejected || 0),
      },
      leaves,
    }, { status: 200 });
  } catch (error) {
    console.error('Get my leaves error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  }
}
