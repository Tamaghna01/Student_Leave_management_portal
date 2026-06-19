import { NextResponse } from 'next/server';
import { verifyAuth } from '@/middleware/auth';
import { verifyRole } from '@/middleware/role';
import LeaveModel from '@/models/leaveModel';

export async function POST(req) {
  try {
    const authDecoded = await verifyAuth(req);
    if (authDecoded.error) {
      return NextResponse.json({ success: false, message: authDecoded.error }, { status: authDecoded.status });
    }

    const roleError = verifyRole(authDecoded.user, 'student');
    if (roleError) {
      return NextResponse.json({ success: false, message: roleError.error }, { status: roleError.status });
    }

    const body = await req.json();
    const { leave_type, start_date, end_date, reason } = body;
    const studentId = authDecoded.user.id;

    // Validate required fields
    if (!leave_type || !start_date || !end_date || !reason) {
      return NextResponse.json({
        success: false,
        message: 'All fields (leave_type, start_date, end_date, reason) are required.',
      }, { status: 400 });
    }

    const start = new Date(start_date);
    const end   = new Date(end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ success: false, message: 'Invalid date format.' }, { status: 400 });
    }

    if (start < today) {
      return NextResponse.json({
        success: false,
        message: 'Start date cannot be in the past.',
      }, { status: 400 });
    }

    if (end < start) {
      return NextResponse.json({
        success: false,
        message: 'End date must be on or after the start date.',
      }, { status: 400 });
    }

    const leave = await LeaveModel.create({
      studentId,
      leaveType: leave_type,
      startDate: start_date,
      endDate:   end_date,
      reason,
    });

    return NextResponse.json({
      success: true,
      message: 'Leave application submitted successfully.',
      leave,
    }, { status: 201 });
  } catch (error) {
    console.error('Apply leave error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  }
}
