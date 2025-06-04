import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Order } from '@/lib/db/models/order.model';
import User from '@/lib/db/models/user.model';

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  paid: 'Payée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

export async function GET() {
  try {
    await connectToDatabase();
    // Populate user and shippingInfo if possible
    const orders = await Order.find({})
      .populate({ path: 'userId', select: 'name email phone' })
      .lean();
    // Add statusLabel to each order
    const ordersWithLabel = orders.map(order => ({
      ...order,
      statusLabel: statusLabels[order.status] || order.status,
    }));
    return NextResponse.json({ orders: ordersWithLabel });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }
    const { status } = await req.json();
    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }
    const updated = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!updated) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, order: { ...updated.toObject(), statusLabel: statusLabels[updated.status] || updated.status } });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ error: 'Failed to update order', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 