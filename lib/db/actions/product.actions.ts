import Product, { IProduct } from '@/lib/db/models/product.model'
import { connectToDatabase } from '@/lib/db'

export async function getProductsByTag({
  tag,
  limit = 10,
}: {
  tag: string
  limit?: number
}) {
  await connectToDatabase()

  const products = await Product.find({
    tags: { $in: [tag] },
    isPublished: true,
  })
    .populate('attributes.attribute') // 💡 هذه هي الإضافة المهمة
    .sort({ createdAt: 'desc' })
    .limit(limit)

  return JSON.parse(JSON.stringify(products)) as IProduct[]
}

export async function getAllProducts() {
  await connectToDatabase()
  const products = await Product.find({}, { _id: 1, name: 1 }).lean()
  return products
}

export async function createProduct(data: any) {
  await connectToDatabase()
  const newProduct = new Product(data)
  await newProduct.save()
  return JSON.parse(JSON.stringify(newProduct))
}
