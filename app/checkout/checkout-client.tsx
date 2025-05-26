'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import useCartStore from '@/hooks/use-cart-store'
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
  const {
    cart: { items, itemsPrice },
  } = useCartStore()

  const router = useRouter()

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    state: '',
    zipCode: '',
  })

  const handleOrder = async () => {
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shippingData: {
            firstName: formData.fullName,
            lastName: '',
            phone: formData.phone,
            email: formData.email,
            address: `${formData.state}, ${formData.zipCode}`,
            city: formData.city,
            postalCode: formData.zipCode,
            country: formData.country,
          },
          cartItems: items,
          totalPrice: itemsPrice,
          userId: null,
        }),
      })

      if (!res.ok) throw new Error('Checkout failed')

      const result = await res.json()
      const orderId = result.order._id
      router.push(`/thank-you?orderId=${orderId}`)
    } catch (err) {
      console.error('Checkout error:', err)
      alert('❌ Failed to place order.')
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <h1 className="text-2xl font-bold">Checkout</h1>
        <Card>
          <CardHeader className="text-lg font-semibold">Shipping Information</CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
            />
            <Input
              placeholder="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
            />
            <Input
              placeholder="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
            />
            <Input
              placeholder="Country"
              name="country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
            />
            <Input
              placeholder="City"
              name="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
            />
            <Input
              placeholder="State"
              name="state"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
            />
            <Input
              placeholder="ZIP Code"
              name="zipCode"
              value={formData.zipCode}
              onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
            />
            <div className="md:col-span-2">
              <label className="flex gap-2 items-start text-sm">
                <input type="checkbox" /> I agree to the Terms and Conditions.
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader className="text-lg font-semibold">Review Your Cart</CardHeader>
          <CardContent className="space-y-4">
            {items.length === 0 ? (
              <p className="text-gray-500">Your cart is empty.</p>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.clientId} className="flex gap-4 items-center border-b pb-2">
                    <div className="w-16 h-16 relative">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-400">${item.price.toFixed(2)} ea</p>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between pt-4 font-semibold text-lg">
                  <span>Total</span>
                  <span>${itemsPrice.toFixed(2)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Button
          className="w-full rounded-full text-white bg-blue-600 hover:bg-blue-700"
          onClick={handleOrder}
        >
          Order Now
        </Button>
        <div className="text-sm text-gray-500 text-center">
          🔒 Secure Checkout - SSL Encrypted
        </div>
      </div>
    </div>
  )
}
