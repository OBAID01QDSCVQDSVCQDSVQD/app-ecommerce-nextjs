// lib/db/actions/order.actions.ts
import { ShippingInfo } from "@/lib/db/models/shipping.model";
import { Order } from "@/lib/db/models/order.model";
import { connectToDatabase } from '@/lib/db'
import Product from '@/lib/db/models/product.model';
import Attribute from '@/lib/db/models/attribute.model';

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
  product: string;
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

  // جلب جميع السمات من قاعدة البيانات
  const attributes = await Attribute.find({});
  const attributesMap = new Map(attributes.map(attr => [attr._id.toString(), attr.name]));

  // التحقق من توفر الستوك قبل إنشاء الطلب
  const stockValidation = await Promise.all(
    cartItems.map(async (item) => {
      console.log('Item attributes:', JSON.stringify(item.attributes, null, 2));
      const product = await Product.findById(item.product).lean();
      console.log('Product variants:', JSON.stringify(product?.variants, null, 2));
      if (!product) {
        return {
          productId: item.product,
          name: item.name,
          isValid: false,
          message: 'المنتج غير موجود'
        };
      }

      if (product.variants && product.variants.length > 0) {
        // التحقق من الستوك للمتغيرات
        console.log('Product attributes:', JSON.stringify(product.attributes, null, 2));
        console.log('Item attributes:', JSON.stringify(item.attributes, null, 2));
        console.log('Product variants:', JSON.stringify(product.variants, null, 2));

        const variant = product.variants.find(v => {
          console.log('Checking variant:', JSON.stringify(v, null, 2));
          const attributeName = attributesMap.get(v.options[0].attributeId.toString());
          if (!attributeName) return false;
          
          // التحقق من وجود السمة في العنصر
          const match = item.attributes.some((itemAttr: any) => {
            console.log('Comparing:', {
              itemAttr,
              attribute: attributeName,
              value: v.options[0].value
            });
            return itemAttr.attribute === attributeName && itemAttr.value === v.options[0].value;
          });
          console.log('Match result:', match);
          return match;
        });

        if (!variant) {
          console.log('No matching variant found');
          return {
            productId: item.product,
            name: item.name,
            isValid: false,
            message: 'المتغير غير موجود'
          };
        }

        if (variant.stock < item.quantity) {
          return {
            productId: item.product,
            name: item.name,
            isValid: false,
            message: `الستوك غير كافٍ. المتوفر: ${variant.stock}`
          };
        }
      } else {
        // التحقق من الستوك الرئيسي
        if (product.countInStock < item.quantity) {
          return {
            productId: item.product,
            name: item.name,
            isValid: false,
            message: `الستوك غير كافٍ. المتوفر: ${product.countInStock}`
          };
        }
      }

      return {
        productId: item.product,
        name: item.name,
        isValid: true
      };
    })
  );

  // التحقق من نتائج التحقق من الستوك
  const invalidItems = stockValidation.filter(item => !item.isValid);
  if (invalidItems.length > 0) {
    throw new Error(JSON.stringify({
      type: 'STOCK_ERROR',
      items: invalidItems
    }));
  }

  // جلب بيانات المنتج لكل عنصر
  const cartItemsWithDetails = await Promise.all(
    cartItems.map(async (item) => {
      const product = await Product.findById(item.product).lean();
      if (!product) return item;
      let variantDetails = {};
      if (product.variants && product.variants.length > 0 && item.attributes && item.attributes.length > 0) {
        const variant = product.variants.find(v =>
          v.options.every(opt => {
            const attributeName = attributesMap.get(opt.attributeId.toString());
            if (!attributeName) return false;
            return item.attributes.some((itemAttr: any) =>
              itemAttr.attribute === attributeName && itemAttr.value === opt.value
            );
          })
        );
        if (variant) {
          console.log('variant._id:', (variant as any)._id);
          variantDetails = {
            variantId: (variant as any)._id,
            variantPrice: variant.price ?? item.price,
            variantStock: variant.stock,
            variantOptions: variant.options || [],
          };
        }
      }
      return {
        product: item.product,
        quantity: item.quantity,
        price: (variantDetails as any).variantPrice ?? item.price,
        name: product.name || '',
        image: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '',
        slug: product.slug || '',
        category: product.category ? (product.category.name || product.category.toString()) : '',
        brand: product.brand || '',
        attributes: item.attributes || [],
        ...variantDetails,
      };
    })
  );

  console.log('cartItemsWithDetails:', cartItemsWithDetails);

  // تحديث الستوك لكل منتج
  for (const item of cartItems) {
    const product = await Product.findById(item.product);
    if (!product) continue;

    if (product.variants && product.variants.length > 0) {
      // تحديث الستوك للمتغيرات
      const variant = product.variants.find(v => 
        v.options.every(opt => {
          const attributeName = attributesMap.get(opt.attributeId.toString());
          if (!attributeName) return false;
          
          return item.attributes.some((itemAttr: any) => 
            itemAttr.attribute === attributeName && itemAttr.value === opt.value
          );
        })
      );

      if (variant) {
        variant.stock = Math.max(0, variant.stock - item.quantity);
      }
    } else {
      // تحديث الستوك الرئيسي
      (product as any).stock = Math.max(0, (product as any).stock - item.quantity);
    }

    // تحديث countInStock
    if (product.variants && product.variants.length > 0) {
      (product as any).countInStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
    } else {
      (product as any).countInStock = (product as any).stock;
    }

    await product.save();
  }

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
