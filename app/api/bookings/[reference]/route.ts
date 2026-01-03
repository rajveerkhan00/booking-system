import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import nodemailer from 'nodemailer';

export async function GET(
    req: Request,
    { params }: { params: { reference: string } }
) {
    try {
        await dbConnect();
        const booking = await Booking.findOne({ bookingReference: params.reference });

        if (!booking) {
            return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, booking });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { reference: string } }
) {
    try {
        await dbConnect();
        const booking = await Booking.findOne({ bookingReference: params.reference });

        if (!booking) {
            return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
        }

        // Check if 24 hours have passed
        const createdAt = new Date(booking.createdAt).getTime();
        const now = new Date().getTime();
        const hoursPassed = (now - createdAt) / (1000 * 60 * 60);

        if (hoursPassed > 24) {
            return NextResponse.json({
                success: false,
                message: 'Cancellation is only allowed within 24 hours of booking creation.'
            }, { status: 400 });
        }

        if (booking.status === 'cancelled') {
            return NextResponse.json({ success: false, message: 'Booking is already cancelled' }, { status: 400 });
        }

        // Update status
        booking.status = 'cancelled';
        await booking.save();

        // Send Cancellation Email
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            const emailContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #fee2e2; border-radius: 16px; overflow: hidden;">
                    <div style="background: #ef4444; padding: 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0;">Booking Cancelled</h1>
                        <p style="color: #fee2e2; margin: 10px 0 0 0;">Reference: ${booking.bookingReference}</p>
                    </div>
                    <div style="padding: 30px;">
                        <p>Hello ${booking.passengerName},</p>
                        <p>Your booking has been successfully cancelled as requested within the 24-hour window.</p>
                        
                        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0;">
                            <p style="margin: 0; color: #64748b;"><strong>Refund Status:</strong> If you made a payment, our team will process your refund shortly according to our terms.</p>
                        </div>

                        <p>If you have any questions, please contact our support team.</p>
                    </div>
                </div>
            `;

            // Email to Admin
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: 'reconditeali@gmail.com',
                subject: `BOOKING CANCELLED: ${booking.passengerName} - ${booking.bookingReference}`,
                html: emailContent,
            });

            // Email to Passenger
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: booking.email,
                subject: `Booking Cancellation Confirmation - ${booking.bookingReference}`,
                html: emailContent,
            });
        }

        return NextResponse.json({ success: true, message: 'Booking cancelled successfully' });
    } catch (error: any) {
        console.error('Cancellation Error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
