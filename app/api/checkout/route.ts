



import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { Order } from '@/lib/db/models/order.model'

export async function POST(req: Request) {
  try {
    console.log('📦 API /checkout called'); 
    await connectToDatabase()

    const body = await req.json()
    const { shippingData, cartItems, totalPrice, userId } = body

    if (!shippingData || !cartItems || !totalPrice) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 })
    }

    const order = await Order.create({
      userId: userId || null, // ✅ null إذا المستخدم مش مسجّل
      shippingInfo: shippingData,
      cartItems,
      totalPrice,
      status: 'pending',
    })

    return NextResponse.json({ order }, { status: 200 })
  } catch (error) {
    console.error('❌ Checkout Error:', error) // ⬅️ باش نعرف السبب
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
