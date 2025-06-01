"use client"

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { getAllAttributes } from '@/lib/db/actions/attribute.actions'

export default function CreateProductPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [category, setCategory] = useState('')
  const [categorySearch, setCategorySearch] = useState('')
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([])
  const [brand, setBrand] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [listPrice, setListPrice] = useState('')
  const [countInStock, setCountInStock] = useState('')
  const [attributes, setAttributes] = useState<any[]>([])
  const [selectedAttributes, setSelectedAttributes] = useState<{ attributeId: string, values: { value: string, image?: string, price?: number }[] }[]>([])
  const [variants, setVariants] = useState<any[]>([])
  const [baseImages, setBaseImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const prevSlugFromNameRef = useRef('')

  useEffect(() => {
    async function fetchAttributes() {
      const res = await getAllAttributes()
      setAttributes(res)
    }
    fetchAttributes()
    async function fetchCategories() {
      const res = await fetch('/api/categories/list')
      const data = await res.json()
      setCategories(data)
    }
    fetchCategories()
  }, [])

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().startsWith(categorySearch.toLowerCase())
  )

  useEffect(() => {
    if (selectedAttributes.length === 0) {
      setVariants([])
      return
    }
    const allValues = selectedAttributes.map(attr =>
      attr.values.map(val => ({ attributeId: attr.attributeId, value: getValueString(val) }))
    )
    function cartesian(arr: any[]): any[] {
      return arr.reduce((a, b) =>
        a.flatMap((d: any) => b.map((e: any) => [...d, e])), [[]]
      )
    }
    const combos = cartesian(allValues)
    setVariants(combos.map((combo, i) => ({
      id: i,
      options: combo,
      price: '',
      image: ''
    })))
  }, [selectedAttributes])

  const uploadImageToCloudinary = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'ecommerce-app')
    const res = await fetch('https://api.cloudinary.com/v1_1/dwio60ll1/image/upload', {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()
    return data.secure_url
  }

  const handleVariantImageChange = async (index: number, file: File | null) => {
    if (!file) return
    const url = await uploadImageToCloudinary(file)
    const newVariants = [...variants]
    newVariants[index].image = url
    setVariants(newVariants)
  }

  const handleVariantPriceChange = (index: number, value: string) => {
    const newVariants = [...variants]
    newVariants[index].price = value
    setVariants(newVariants)
  }

  // Helper to get value as string
  const getValueString = (val: any) => typeof val === 'object' && val !== null ? val.label || val.value || '' : val || ''

  const handleAttributeValueChange = (attributeId: string, value: any, checked: boolean) => {
    const valueStr = getValueString(value)
    setSelectedAttributes(prev => {
      const idx = prev.findIndex(a => a.attributeId === attributeId)
      if (idx === -1 && checked) {
        return [...prev, { attributeId, values: [{ value: valueStr }] }]
      }
      if (idx !== -1) {
        const values = prev[idx].values
        const exists = values.find(v => getValueString(v.value) === valueStr)
        let newValues
        if (checked && !exists) {
          newValues = [...values, { value: valueStr }]
        } else if (!checked && exists) {
          newValues = values.filter(v => getValueString(v.value) !== valueStr)
        } else {
          newValues = values
        }
        if (newValues.length === 0) {
          return prev.filter((_, i) => i !== idx)
        }
        const updated = [...prev]
        updated[idx] = { ...updated[idx], values: newValues }
        return updated
      }
      return prev
    })
  }

  const handleAttributeValueImage = async (attributeId: string, value: any, file: File | null) => {
    if (!file) return
    const valueStr = getValueString(value)
    const url = await uploadImageToCloudinary(file)
    setSelectedAttributes(prev => prev.map(attr =>
      attr.attributeId !== attributeId ? attr : {
        ...attr,
        values: attr.values.map(v => getValueString(v.value) === valueStr ? { ...v, image: url } : v)
      }
    ))
  }

  const handleAttributeValuePrice = (attributeId: string, value: any, price: string) => {
    const valueStr = getValueString(value)
    setSelectedAttributes(prev => prev.map(attr =>
      attr.attributeId !== attributeId ? attr : {
        ...attr,
        values: attr.values.map(v => getValueString(v.value) === valueStr ? { ...v, price: price ? parseFloat(price) : undefined } : v)
      }
    ))
  }

  useEffect(() => {
    if (name && (!slug || slug === prevSlugFromNameRef.current)) {
      const generated = name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
      setSlug(generated)
      prevSlugFromNameRef.current = generated
    }
  }, [name, slug])

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      const attributesForDb = selectedAttributes.flatMap(attr =>
        attr.values.map(valObj => ({
          attribute: attr.attributeId,
          value: valObj.value,
          image: valObj.image,
          price: valObj.price,
        }))
      )
      const productData = {
        name,
        slug,
        category,
        brand,
        description,
        price: parseFloat(price) || 0,
        listPrice: parseFloat(listPrice) || 0,
        countInStock: parseInt(countInStock) || 0,
        images: baseImages,
        attributes: attributesForDb,
        variants,
        isPublished: true,
        avgRating: 0,
        numReviews: 0,
        numSales: 0,
        tags: ['new arrival'],
      }

      const res = await fetch('/api/products/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      })

      const data = await res.json()
      if (data.success) {
        router.push('/admin/products')
        router.refresh()
      } else {
        setError(data.message || 'Error creating product')
      }
    } catch (err: any) {
      setError(err.message || 'Error creating product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Product</h1>
      <Card>
        <CardHeader>General Info</CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Product Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <Input
            placeholder="Slug"
            value={slug}
            onChange={e => setSlug(e.target.value)}
          />
          {/* حقل اختيار التصنيف (Autocomplete) */}
          <div>
            <label className="block font-medium mb-1">Category</label>
            <Input
              placeholder="Search category..."
              value={categorySearch}
              onChange={e => setCategorySearch(e.target.value)}
              className="mb-2"
            />
            {categorySearch && (
              <div className="border rounded bg-white max-h-40 overflow-y-auto">
                {filteredCategories.length === 0 && (
                  <div className="p-2 text-gray-400">No categories found</div>
                )}
                {filteredCategories.map((cat) => (
                  <div
                    key={cat._id}
                    className={`p-2 cursor-pointer hover:bg-gray-100 ${category === cat._id ? 'bg-gray-200' : ''}`}
                    onClick={() => {
                      setCategory(cat._id)
                      setCategorySearch(cat.name)
                    }}
                  >
                    {cat.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <Input
            placeholder="Brand"
            value={brand}
            onChange={e => setBrand(e.target.value)}
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full min-h-[100px] rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical text-base"
          />
          <Input
            placeholder="Base Price (optional)"
            value={price}
            onChange={e => setPrice(e.target.value)}
          />
          <Input
            placeholder="List Price"
            type="number"
            value={listPrice}
            onChange={e => setListPrice(e.target.value)}
          />
          <Input
            placeholder="Count In Stock"
            type="number"
            value={countInStock}
            onChange={e => setCountInStock(e.target.value)}
          />
          {/* رفع صور المنتج الأساسية */}
          <div>
            <h2 className="font-semibold mb-2">Product Images</h2>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={async (e) => {
                if (!e.target.files) return
                const files = Array.from(e.target.files)
                const urls: string[] = []
                for (const file of files) {
                  const url = await uploadImageToCloudinary(file)
                  urls.push(url)
                }
                setBaseImages(urls)
              }}
            />
            <div className="flex gap-2 mt-2">
              {baseImages.map((img, i) => (
                img && img.trim() !== "" ? (
                  <img key={i} src={img} alt="base" className="w-16 h-16 object-contain" />
                ) : null
              ))}
            </div>
          </div>
          {/* اختيار الخصائص */}
          <div>
            <h2 className="font-semibold mb-2">Attributes</h2>
            {attributes.map(attr => (
              <div key={attr._id} className="mb-2">
                <div className="font-medium">{attr.name}</div>
                <div className="flex flex-wrap gap-2">
                  {attr.values.map((val: any) => {
                    const valueStr = getValueString(val)
                    const selectedAttr = selectedAttributes.find(a => a.attributeId === attr._id)
                    const selectedVal = selectedAttr?.values.find((v: any) => getValueString(v.value) === valueStr)
                    return (
                      <div key={val._id || valueStr} className="flex flex-col items-center mr-4">
                        <label className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            onChange={e => handleAttributeValueChange(attr._id, val, e.target.checked)}
                            checked={!!selectedVal}
                          />
                          <span>{valueStr}</span>
                        </label>
                        {/* تم حذف حقول الصورة والسعر من هنا بناءً على طلب المستخدم */}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          {/* جدول التركيبات (Variants) */}
          {variants.length > 0 && (
            <div>
              <h2 className="font-semibold mb-2">Variants</h2>
              <div className="space-y-2">
                {variants.map((variant, i) => (
                  <div key={i} className="flex items-center gap-4 border p-2 rounded">
                    <div className="flex gap-2">
                      {variant.options.map((opt: any, idx: number) => (
                        <span key={idx} className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {attributes.find(a => a._id === opt.attributeId)?.name}: {getValueString(opt.value)}
                        </span>
                      ))}
                    </div>
                    <Input
                      type="number"
                      placeholder="Price"
                      value={variant.price}
                      onChange={e => handleVariantPriceChange(i, e.target.value)}
                      className="w-24"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleVariantImageChange(i, e.target.files?.[0] || null)}
                    />
                    {variant.image && variant.image.trim() !== "" && (
                      <img src={variant.image} alt="variant" className="w-12 h-12 object-contain" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          <Button type="submit" className="mt-4" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Save Product'}
          </Button>
          {error && <div className="text-red-500 mt-2">{error}</div>}
        </CardContent>
      </Card>
    </div>
  )
}