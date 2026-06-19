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

    const stats = await LeaveModel.getStats();

    const total    = parseInt(stats.total || 0);
    const pending  = parseInt(stats.pending || 0);
    const approved = parseInt(stats.approved || 0);
    const rejected = parseInt(stats.rejected || 0);

    return NextResponse.json({
      success: true,
      stats: {
        total,
        pending,
        approved,
        rejected,
        approvalPercentage:  total > 0 ? Math.round((approved / total) * 100) : 0,
        rejectionPercentage: total > 0 ? Math.round((rejected / total) * 100) : 0,
        pendingPercentage:   total > 0 ? Math.round((pending  / total) * 100) : 0,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  }
}
