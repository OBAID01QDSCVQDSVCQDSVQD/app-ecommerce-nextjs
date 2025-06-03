"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { getAttributeById, updateAttribute } from '@/lib/db/actions/attribute.actions'

export default function EditAttributePage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [name, setName] = useState('')
  const [values, setValues] = useState([{ label: '' }])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAttribute = async () => {
      if (!id) return
      const res = await getAttributeById(id)
      if (res && res.success && res.attribute) {
        const attr = Array.isArray(res.attribute) ? res.attribute[0] : res.attribute
        setName(attr.name)
        setValues(
          (attr.values || []).map((val: any) => ({
            label: val.label || '',
          }))
        )
      }
      setLoading(false)
    }
    fetchAttribute()
  }, [id])

  const handleAddValue = () => {
    setValues([...values, { label: '' }])
  }

  const handleChangeValue = (index: number, field: keyof typeof values[number], value: string) => {
    const newValues = [...values]
    newValues[index][field] = value
    setValues(newValues)
  }

  const handleSubmit = async () => {
    await updateAttribute(id, {
      name,
      values: values.map((val) => ({
        label: val.label,
      })),
    })
    router.push('/admin/attributes')
  }

  if (loading) return <div className="p-4">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Attribute</h1>
      <Card>
        <CardHeader>Edit Info</CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Attribute Name (e.g. Color, Size)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {values.map((val, i) => (
            <div key={i} className="grid grid-cols-1 gap-4">
              <Input
                placeholder="Value"
                value={val.label}
                onChange={(e) => handleChangeValue(i, 'label', e.target.value)}
              />
            </div>
          ))}

          <Button type="button" onClick={handleAddValue}>
            + Add Value
          </Button>

          <Button type="submit" className="mt-4" onClick={handleSubmit}>
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 