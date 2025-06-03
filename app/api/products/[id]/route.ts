import { NextRequest, NextResponse } from 'next/server'
import { updateProduct } from '@/lib/actions/product.actions'
import Product from '@/lib/db/models/product.model'

export async function PUT(
  req: NextRequest,
  context: any
) {
  console.log('PUT request received')
  try {
    const id = context.params.id
    console.log('Product ID:', id)
    
    const data = await req.json()
    console.log('Received data:', data)

    // Get existing product
    const existingProduct = await Product.findById(id).lean()
    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Prepare update data with only changed fields
    const updateData = {
      _id: id,
      ...(data.name && { name: data.name }),
      ...(data.price && { price: parseFloat(data.price) }),
      ...(data.category && { category: data.category }),
      ...(data.description !== undefined && { description: data.description || '' }),
      ...(data.stock !== undefined && { stock: parseInt(data.stock) })
    }

    console.log('Sending to updateProduct:', updateData)

    const result = await updateProduct(updateData)
    console.log('Update result:', result)

    if (!result.success) {
      console.error('Update failed:', result.message)
      return NextResponse.json({ error: result.message }, { status: 500 })
    }

    const updatedProduct = await Product.findById(id)
      .populate('category', 'name')
      .lean()

    console.log('Updated product:', updatedProduct)

    return NextResponse.json({ product: updatedProduct })
  } catch (error) {
    console.error('Error in PUT /api/products/[id]:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}
