'use client'

import { useSession } from 'next-auth/react'
import useCartStore from '@/hooks/use-cart-store'
import ProductPrice from '@/components/shared/product/product-price'

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const {
    cart: { items, itemsPrice },
  } = useCartStore()

  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      {status === 'loading' && <p>Loading...</p>}

      {status === 'authenticated' && session?.user && (
        <>
          <p className="text-gray-700 mb-6">
            Welcome, <strong>{session.user.name}</strong>
          </p>

          <section className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Your Cart</h2>

            {items.length ? (
              <ul className="divide-y divide-gray-200">
                {items.map((item) => (
                  <li key={item.clientId} className="py-4 flex justify-between">
                    <span>{item.name}</span>
                    <span>
                      {item.quantity} ×{' '}
                      <ProductPrice price={item.price} plain />
                    </span>
                  </li>
                ))}
                <li className="pt-4 font-bold flex justify-between">
                  <span>Total ({totalQuantity} items):</span>
                  <span>
                    <ProductPrice price={itemsPrice} plain />
                  </span>
                </li>
              </ul>
            ) : (
              <p className="text-gray-500">Your cart is empty.</p>
            )}
          </section>
        </>
      )}

      {status === 'unauthenticated' && (
        <div className="text-red-500">
          Please <a href="/sign-in?callbackUrl=/checkout">sign in</a> to continue.
        </div>
      )}
    </div>
  )
}

