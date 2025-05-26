// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import { createOrderWithShipping } from "@/lib/db/actions/order.actions";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      shippingData,
      cartItems,
      totalPrice,
      userId, // تنجم تجيبها من الـ session إذا تحب
    } = body;

    if (!shippingData || !cartItems || !totalPrice) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const order = await createOrderWithShipping(
      shippingData,
      cartItems,
      totalPrice,
      userId
    );

    return NextResponse.json({ order }, { status: 200 });
  } catch (err) {
    console.error("Checkout Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
