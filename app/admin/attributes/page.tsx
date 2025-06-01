// app/admin/attributes/page.tsx

'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { getAllAttributes } from '@/lib/db/actions/attribute.actions'

interface AttributeValue {
  value: string
  image?: string
  price?: number
}

interface Attribute {
  _id: string
  name: string
  values: AttributeValue[]
}

export default function AttributesPage() {
  const [attributes, setAttributes] = useState<Attribute[]>([])

  useEffect(() => {
    const fetchAttributes = async () => {
      const res = await getAllAttributes()
      setAttributes(res as unknown as Attribute[])
    }
    fetchAttributes()
  }, [])

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Attributes</h1>
        <Button asChild>
          <Link href="/admin/attributes/create">+ Add Attribute</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {attributes.map((attr) => (
          <Card key={attr._id}>
            <CardHeader className="text-lg font-semibold flex justify-between">
              <span>{attr.name}</span>
              <Link href={`/admin/attributes/${attr._id}/edit`} className="text-sm text-blue-600 hover:underline">
                Edit
              </Link>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {attr.values.map((val, i) => (
                  <div key={i} className="border p-2 rounded">
                    <p className="text-sm font-medium">{val.value}</p>
                    {val.image && <img src={val.image} alt={val.value} className="w-12 h-12 object-contain mt-1" />}
                    {val.price !== undefined && (
                      <p className="text-xs text-gray-500">+${val.price}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
