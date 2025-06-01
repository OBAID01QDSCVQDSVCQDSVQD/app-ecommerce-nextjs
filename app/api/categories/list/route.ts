import { NextResponse } from 'next/server'
import { getAllCategories } from '@/lib/db/actions/category.actions'

export async function GET() {
  const categories = await getAllCategories()
  return NextResponse.json(categories)
} 