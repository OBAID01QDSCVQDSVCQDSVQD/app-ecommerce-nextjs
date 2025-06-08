import '@/lib/db/mongoose';
import { Service } from '@/lib/db/models/service.model';
import { Appointment } from '@/lib/db/models/appointment.model';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth';

export async function GET() {
  try {
    const appointments = await Appointment.find()
      .populate('serviceId', 'name')
      .sort({ createdAt: -1 });
    const missingServices = appointments
      .filter(a => typeof a.serviceId === 'string')
      .map(a => a.serviceId);
    return NextResponse.json({ appointments, missingServices });
  } catch (error: unknown) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      {
        error: 'Error fetching appointments',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const appointmentId = searchParams.get('appointmentId');
    if (!appointmentId) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    const data = await req.json();
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status: data.status },
      { new: true }
    );

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Error updating appointment' },
      { status: 500 }
    );
  }
} 