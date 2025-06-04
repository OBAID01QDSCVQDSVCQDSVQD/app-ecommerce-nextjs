// lib/db/actions/order.actions.ts
import { ShippingInfo } from "@/lib/db/models/shipping.model";
import { Order } from "@/lib/db/models/order.model";
import { connectToDatabase } from '@/lib/db'
import Product from '@/lib/db/models/product.model';

interface ShippingData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  image: string;
  slug: string;
  category: string;
  brand: string;
  size?: string;
  color?: string;
  attributes: any;
}

export async function createOrderWithShipping(
  shippingData: ShippingData,
  cartItems: CartItem[],
  totalPrice: number,
  userId?: string
) {
  await connectToDatabase();

  // جلب بيانات المنتج لكل عنصر
  const cartItemsWithDetails = await Promise.all(
    cartItems.map(async (item) => {
      const product = await Product.findById(item.productId).lean();
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        name: product?.name || '',
        image: Array.isArray(product?.images) && product.images.length > 0 ? product.images[0] : '',
        attributes: item.attributes,
        // أضف أي بيانات أخرى تريد حفظها
      };
    })
  );

  const shippingDoc = await ShippingInfo.create(shippingData);

  // Generate sequential orderNumber with year prefix
  const currentYear = new Date().getFullYear();
  // Find the last order by orderNumber (descending)
  const lastOrder = await Order.findOne({}).sort({ orderNumber: -1 }).lean();
  let nextNumber = 1;
  if (lastOrder && (lastOrder as any).orderNumber) {
    const match = (lastOrder as any).orderNumber.match(/^(\d{4})-(\d{5,})$/);
    if (match) {
      nextNumber = parseInt(match[2], 10) + 1;
    }
  }
  const orderNumber = `${currentYear}-${String(nextNumber).padStart(5, '0')}`;

  const orderDoc = await Order.create({
    userId,
    cartItems: cartItemsWithDetails,
    totalPrice,
    shippingInfo: shippingDoc._id,
    status: "pending",
    orderNumber,
  });

  return orderDoc;
}
