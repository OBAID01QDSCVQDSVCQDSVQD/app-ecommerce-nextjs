import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Category } from '@/lib/db/models/category.model';

export async function GET() {
  await connectToDatabase();
  const categories = await Category.find().lean();
  return NextResponse.json({ categories });
}

