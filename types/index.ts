import { CartSchema, OrderItemSchema, ProductInputSchema, UserInputSchema, UserSignInSchema } from '@/lib/validator'
import { z } from 'zod'

export type IProductInput = z.infer<typeof ProductInputSchema> & {
  attributes?: {
    attribute: string;
    value: string;
    image?: string;
    price?: number;
  }[];
}
export type IUserInput = z.infer<typeof UserInputSchema>
export type IUserSignIn = z.infer<typeof UserSignInSchema>
export type IUserSignUp = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  whatsapp: string;
}
export type Data = {
  products: IProductInput[]
  users: IUserInput[]
  headerMenus: {
    name: string
    href: string
  }[]
  carousels: {
    image: string
    url: string
    title: string
    buttonCaption: string
    isPublished: boolean
  }[]
}

export type OrderItem = z.infer<typeof OrderItemSchema> & {
  attributes?: { attribute: string; value: string }[];
};
export type Cart = z.infer<typeof CartSchema>

console.log('cart items:', CartSchema)