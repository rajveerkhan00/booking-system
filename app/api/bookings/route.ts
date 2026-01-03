import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const data = await req.json();

        // 1. Connect to Database
        await dbConnect();

        // 2. Generate Booking Reference (e.g., BK-123456)
        const bookingReference = `BK-${Math.floor(100000 + Math.random() * 900000)}`;

        // 3. Save to MongoDB
        const newBooking = await Booking.create({ ...data, bookingReference });

        // 4. Send Email
        // Note: You need EMAIL_USER and EMAIL_PASS in your .env.local file
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            throw new Error('Email credentials are not defined in .env.local');
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const emailContent = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
                <div style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Booking Confirmation</h1>
                    <p style="color: #ccfbf1; margin: 10px 0 0 0; font-size: 16px;">Reference: <strong>${bookingReference}</strong></p>
                </div>
                
                <div style="padding: 30px;">
                    <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">New ${data.bookingType === 'rental' ? 'Car Rental' : 'Transfer'} Booking</h2>
                    
                    <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #f1f5f9;">
                        <h3 style="margin-top: 0; color: #0d9488; font-size: 16px; text-transform: uppercase; letter-spacing: 0.05em;">Trip Details</h3>
                        <p style="margin: 8px 0; color: #334155;"><strong>From:</strong> ${data.fromLocation}</p>
                        <p style="margin: 8px 0; color: #334155;"><strong>To:</strong> ${data.toLocation}</p>
                        <p style="margin: 8px 0; color: #334155;"><strong>Pickup Date:</strong> ${data.date}</p>
                        <p style="margin: 8px 0; color: #334155;"><strong>Pickup Time:</strong> ${data.pickupTime}</p>
                        ${data.bookingType === 'rental' ? `
                        <p style="margin: 8px 0; color: #334155;"><strong>Dropoff Date:</strong> ${data.dropoffDate}</p>
                        <p style="margin: 8px 0; color: #334155;"><strong>Dropoff Time:</strong> ${data.dropoffTime}</p>
                        ` : `
                        <p style="margin: 8px 0; color: #334155;"><strong>Passengers:</strong> ${data.passengers}</p>
                        `}
                    </div>

                    <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #f1f5f9;">
                        <h3 style="margin-top: 0; color: #0d9488; font-size: 16px; text-transform: uppercase; letter-spacing: 0.05em;">Vehicle & Price</h3>
                        <p style="margin: 8px 0; color: #334155;"><strong>Vehicle:</strong> ${data.selectedVehicle?.name}</p>
                        <p style="margin: 8px 0; color: #334155; font-size: 18px;"><strong style="color: #0d9488;">Total Price:</strong> ${data.currency} ${data.totalPrice}</p>
                    </div>

                    <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #f1f5f9;">
                        <h3 style="margin-top: 0; color: #0d9488; font-size: 16px; text-transform: uppercase; letter-spacing: 0.05em;">${data.bookingType === 'rental' ? 'Driver' : 'Passenger'} Info</h3>
                        <p style="margin: 8px 0; color: #334155;"><strong>Name:</strong> ${data.passengerTitle || ''} ${data.passengerName}</p>
                        <p style="margin: 8px 0; color: #334155;"><strong>Email:</strong> ${data.email}</p>
                        <p style="margin: 8px 0; color: #334155;"><strong>Phone:</strong> ${data.countryCode || ''} ${data.phone}</p>
                    </div>

                    <div style="padding: 20px; background: #fffbeb; border-radius: 12px; border: 1px solid #fef3c7;">
                        <p style="margin: 0; color: #92400e; font-size: 14px;">
                            <strong>Note:</strong> You can cancel this booking within 24 hours of creation. Use your reference number <strong>${bookingReference}</strong> to manage your booking on our website.
                        </p>
                    </div>
                </div>
                
                <div style="background: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
                    <p style="margin: 0;">&copy; ${new Date().getFullYear()} Booking System. All rights reserved.</p>
                </div>
            </div>
        `;

        // Email to Admin
        const adminMailOptions = {
            from: process.env.EMAIL_USER,
            to: 'reconditeali@gmail.com',
            subject: `NEW BOOKING: ${data.passengerName} - ${bookingReference}`,
            html: emailContent,
        };

        // Email to Passenger
        const passengerMailOptions = {
            from: process.env.EMAIL_USER,
            to: data.email,
            subject: `Your Booking Confirmation - ${bookingReference}`,
            html: emailContent,
        };

        await Promise.all([
            transporter.sendMail(adminMailOptions),
            transporter.sendMail(passengerMailOptions)
        ]);

        return NextResponse.json({
            success: true,
            message: 'Booking saved and emails sent',
            bookingId: newBooking._id,
            bookingReference
        }, { status: 201 });

    } catch (error: any) {
        console.error('Booking API Error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
