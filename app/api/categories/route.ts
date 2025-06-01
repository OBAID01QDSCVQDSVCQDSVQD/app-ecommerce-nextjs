import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { Category } from '@/lib/db/models/category.model'

// Connect to MongoDB
const connectToDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!)
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    throw error
  }
}

export async function GET() {
  try {
    await connectToDB()
    const categories = await Category.find({}).sort({ name: 1 })
    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    await connectToDB()
    const body = await request.json()
    const category = await Category.create(body)
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
