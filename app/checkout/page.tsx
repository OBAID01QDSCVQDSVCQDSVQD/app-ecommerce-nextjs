'use client'

import { useSession } from 'next-auth/react'
import useCartStore from '@/hooks/use-cart-store'
import ProductPrice from '@/components/shared/product/product-price'
import CheckoutClient from './checkout-client'

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const {
    cart: { items, itemsPrice },
  } = useCartStore()

  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <CheckoutClient />
  )
}

