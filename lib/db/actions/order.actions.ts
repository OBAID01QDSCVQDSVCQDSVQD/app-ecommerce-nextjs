// lib/db/actions/order.actions.ts
import { ShippingInfo } from "@/lib/db/models/shipping.model";
import { Order } from "@/lib/db/models/order.model";
import { connectToDatabase } from '@/lib/db'

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
}

export async function createOrderWithShipping(
  shippingData: ShippingData,
  cartItems: CartItem[],
  totalPrice: number,
  userId?: string
) {
  await connectToDatabase();

  const shippingDoc = await ShippingInfo.create(shippingData);

  const orderDoc = await Order.create({
    userId,
    cartItems,
    totalPrice,
    shippingInfo: shippingDoc._id,
    status: "pending",
  });

  return orderDoc;
}
