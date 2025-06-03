import mongoose from 'mongoose'
import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { Order } from '@/lib/db/models/order.model'

import { getServerSession } from "next-auth";
import authConfig from '@/auth.config';


export async function POST(req: Request) {
  try {
    await connectToDatabase()

    const session = await getServerSession(authConfig)
    console.log('📦 SESSION IN BACKEND:', session)
    const userId = session?.user?.id || null

    const body = await req.json()
    const { shippingData, cartItems, totalPrice } = body

    if (!shippingData || !cartItems || !totalPrice) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 })
    }

    const order = await Order.create({
      userId, // هذا المرة يجي من الجلسة مش من العميل
      shippingInfo: shippingData,
      cartItems,
      totalPrice,
      status: 'pending',
    })

    return NextResponse.json({ order }, { status: 200 })
  } catch (error) {
    console.error('❌ Checkout Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

