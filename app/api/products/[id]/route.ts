import { NextRequest, NextResponse } from 'next/server'
import { updateProduct } from '@/lib/actions/product.actions'
import Product from '@/lib/db/models/product.model'

export async function PUT(
  req: NextRequest,
  context: any // <-- هذا اللي يقطع الشك نهائياً
) {
  const id = context.params.id
  const data = await req.json()

  const updatedData = {
    ...data,
    name: data.name,
    price: parseFloat(data.price),
    category: data.category,
    stock: parseInt(data.stock),
    description: data.description,
  }

  if (typeof updatedData.category === 'object' && updatedData.category !== null) {
    delete updatedData.category.name
  }

  const { _id, ...dataToSend } = updatedData

  const result = await updateProduct({ ...dataToSend, _id: id })

  if (result.success) {
    const updatedProduct = await Product.findById(id).lean()
    return NextResponse.json({ product: updatedProduct })
  } else {
    return NextResponse.json({ error: result.message }, { status: 500 })
  }
}
