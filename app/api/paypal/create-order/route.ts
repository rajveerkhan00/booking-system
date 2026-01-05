import { NextResponse } from "next/server";
import { createOrder } from "@/lib/paypal";

export async function POST(req: Request) {
    try {
        const { amount, currency } = await req.json();
        const order = await createOrder(amount, currency || "USD");
        return NextResponse.json(order);
    } catch (error: any) {
        console.error("PayPal Create Order Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
