import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { connectToDatabase } from '@/lib/db';
import Product from '@/lib/db/models/product.model';
import { Category } from '@/lib/db/models/category.model';

async function fixGenericProductsCategory() {
  await connectToDatabase();

  const shoesCategory = await Category.findOne({ slug: 'shoes' });
  if (!shoesCategory) {
    console.error('❌ Category "shoes" not found!');
    return;
  }

  // نجيب جميع المنتجات ثم نفلتر فقط إلي عندهم category = "Shoes"
  const allProducts = await Product.find({});
  const targetProducts = allProducts.filter(p => p.category === 'Shoes');

  let updated = 0;
  for (const product of targetProducts) {
    product.category = shoesCategory._id;
    await product.save();
    updated++;
    console.log(`✅ Updated "${product.name}" → Shoes`);
  }

  console.log(`\n🎉 Done. Updated ${updated} product(s).`);
  process.exit(0);
}

fixGenericProductsCategory().catch((err) => {
  console.error('❌ Script failed:', err);
  process.exit(1);
});
