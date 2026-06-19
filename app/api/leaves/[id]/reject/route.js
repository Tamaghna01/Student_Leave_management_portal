import { NextResponse } from 'next/server';
import { verifyAuth } from '@/middleware/auth';
import { verifyRole } from '@/middleware/role';
import LeaveModel from '@/models/leaveModel';

export async function PATCH(req, { params }) {
  try {
    const authDecoded = await verifyAuth(req);
    if (authDecoded.error) {
      return NextResponse.json({ success: false, message: authDecoded.error }, { status: authDecoded.status });
    }

    const roleError = verifyRole(authDecoded.user, 'faculty');
    if (roleError) {
      return NextResponse.json({ success: false, message: roleError.error }, { status: roleError.status });
    }

    const { id } = await params;
    const body = await req.json();
    const { faculty_remark } = body;

    const leave = await LeaveModel.findById(id);
    if (!leave) {
      return NextResponse.json({ success: false, message: 'Leave request not found.' }, { status: 404 });
    }

    if (leave.status !== 'pending') {
      return NextResponse.json({
        success: false,
        message: `Leave is already ${leave.status}. Only pending requests can be reviewed.`,
      }, { status: 400 });
    }

    const updated = await LeaveModel.updateStatus(id, 'rejected', faculty_remark);

    return NextResponse.json({
      success: true,
      message: 'Leave request rejected.',
      leave:   updated,
    }, { status: 200 });
  } catch (error) {
    console.error('Reject leave error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  }
}
