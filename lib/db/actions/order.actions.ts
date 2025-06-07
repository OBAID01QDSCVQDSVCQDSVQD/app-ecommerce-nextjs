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

  // دمج الكميات لنفس المنتج/الفاريونت
  function mergeCartItems(cartItems: CartItem[]) {
    const merged: CartItem[] = [];
    for (const item of cartItems) {
      const found = merged.find(i =>
        i.product === item.product &&
        JSON.stringify(i.attributes) === JSON.stringify(item.attributes)
      );
      if (found) {
        found.quantity += item.quantity;
      } else {
        merged.push({ ...item });
      }
    }
    return merged;
  }
  const mergedCartItems = mergeCartItems(cartItems);

  // جلب جميع السمات من قاعدة البيانات
  const attributes = await Attribute.find({});
  const attributesMap = new Map(attributes.map(attr => [attr._id.toString(), attr.name]));

  // التحقق من توفر الستوك قبل إنشاء الطلب
  const stockValidation = await Promise.all(
    mergedCartItems.map(async (item) => {
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
        const variant = product.variants.find(v =>
          v.options.every(opt => {
            const attributeName = attributesMap.get(opt.attributeId.toString());
            return item.attributes.some((itemAttr: any) =>
              itemAttr.attribute === attributeName && itemAttr.value === opt.value
            );
          }) && v.options.length === item.attributes.length
        );

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
    mergedCartItems.map(async (item) => {
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
  for (const item of mergedCartItems) {
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
        variant.numSales += item.quantity;
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

    // تحديث عدد المبيعات (numSales)
    await Product.findByIdAndUpdate(item.product, { $inc: { numSales: item.quantity } });
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
