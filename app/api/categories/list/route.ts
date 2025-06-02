import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/mongoose'
import { Category } from '@/lib/db/models/category.model'

export async function GET() {
  await connectToDatabase()
  const categories = await Category.find().select('name slug')
  return NextResponse.json({ categories })
} 