'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiEdit2, FiTrash2, FiPlus, FiX, FiEye, FiFilter } from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import React from 'react'

interface Product {
  _id: string
  name: string
  description: string
  price: number
  category: {
    name: string
  }
  stock: number
  images: string[]
  createdAt: string
}

interface Filters {
  category: string
  minPrice: string
  maxPrice: string
  minStock: string
  maxStock: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>({
    category: '',
    minPrice: '',
    maxPrice: '',
    minStock: '',
    maxStock: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([])
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [productToEdit, setProductToEdit] = useState<Product | null>(null)
  const [editForm, setEditForm] = useState({ name: '', price: '', category: '', stock: '', description: '' })
  const [editLoading, setEditLoading] = useState(false)

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [page, filters])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(filters.category && { category: filters.category }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.minStock && { minStock: filters.minStock }),
        ...(filters.maxStock && { maxStock: filters.maxStock }),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      })
      
      const res = await fetch(`/api/products?${queryParams}`)
      const data = await res.json()
      setProducts(data.data)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Échec du chargement des produits')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const resetFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      minStock: '',
      maxStock: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
    setPage(1)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        toast.success('Produit supprimé avec succès')
        fetchProducts()
      } else {
        toast.error('Échec de la suppression du produit')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Échec de la suppression du produit')
    }
  }

  const openEditModal = (product: Product) => {
    setProductToEdit(product)
    setEditForm({
      name: product.name,
      price: String(product.price ?? ''),
      category: categories.find(c => c.name === product.category?.name)?._id || '',
      stock: String(product.stock ?? ''),
      description: product.description || ''
    })
    setEditModalOpen(true)
  }

  const handleEditChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  const handleEditSave = async () => {
    console.log('handleEditSave called')
    if (!productToEdit) {
      console.log('No product to edit')
      return
    }
    
    setEditLoading(true)
    try {
      console.log('Current form data:', editForm)
      
      // Prepare data with only changed fields
      const updatedData = {
        ...(editForm.name !== productToEdit.name && { name: editForm.name }),
        ...(editForm.price && parseFloat(editForm.price) !== productToEdit.price && { price: parseFloat(editForm.price) }),
        ...(editForm.category && editForm.category !== (productToEdit.category as any)?._id && { category: editForm.category }),
        ...(editForm.stock !== undefined && { stock: editForm.stock === '' ? 0 : parseInt(editForm.stock) }),
        ...(editForm.description !== productToEdit.description && { description: editForm.description || '' })
      }

      // If no fields were changed, show message and return
      if (Object.keys(updatedData).length === 0) {
        toast.error('Aucune modification détectée')
        setEditLoading(false)
        return
      }

      console.log('Sending update request:', {
        id: productToEdit._id,
        data: updatedData
      })

      const res = await fetch(`/api/products/${productToEdit._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      })

      console.log('Response status:', res.status)
      
      if (!res.ok) {
        const errorData = await res.json()
        console.error('Update failed:', errorData)
        throw new Error(errorData.error || 'Erreur lors de la modification')
      }

      const data = await res.json()
      console.log('Update successful:', data)

      // Update local state
      setProducts(prev =>
        prev.map(p =>
          p._id === productToEdit._id
            ? {
                ...data.product,
                category: categories.find(c => c._id === String(data.product.category)) || data.product.category
              }
            : p
        )
      )

      // Close modal and show success message
      setEditModalOpen(false)
      toast.success('Produit modifié avec succès')
      
    } catch (error) {
      console.error('Error in handleEditSave:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la modification')
    } finally {
      setEditLoading(false)
    }
  }

  // Modal component
  function ProductModal({ product, onClose }: { product: Product, onClose: () => void }) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center min-h-screen py-4 backdrop-blur-sm bg-black/30 pointer-events-auto"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-xs sm:max-w-lg mx-2 p-4 sm:p-6 relative animate-fade-in max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 text-2xl font-bold focus:outline-none"
            aria-label="Fermer"
          >
            &times;
          </button>
          <div className="flex flex-col items-center gap-4">
            <img
              src={product.images[0] || '/placeholder.jpg'}
              alt={product.name}
              className="w-40 h-40 object-contain rounded-lg border bg-white dark:bg-gray-800"
            />
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{product.name}</h2>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Catégorie: {product.category?.name || '-'}</div>
              <div className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">{product.price.toFixed(2)} €</div>
              <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">Stock: {product.stock}</div>
              <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">{product.description}</div>
              {product.images.length > 1 && (
                <div className="flex gap-2 mt-2 flex-wrap justify-center">
                  {product.images.slice(1).map((img, i) => (
                    <img key={i} src={img} alt="extra" className="w-14 h-14 object-contain rounded border bg-white dark:bg-gray-800" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-100 dark:bg-gray-950 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestion des Produits</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setFiltersOpen(true)}
            className="flex items-center gap-4 px-2 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 shadow hover:bg-blue-50 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-400 text-sm font-semibold transition cursor-pointer"
          >
            <FiFilter className="w-4 h-4" />
            Filtres
          </button>
          <button
            onClick={() => router.push('/admin/products/create')}
            className="bg-blue-600 text-white px-5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors text-sm"
          >
            <FiPlus className="w-4 h-4" /> Ajouter un Produit
          </button>
        </div>
      </div>

      {/* Filters Modal/Panel */}
      {filtersOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md mx-2 p-6 relative animate-fade-in max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setFiltersOpen(false)}
              className="absolute top-3 right-3 text-gray-500 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 text-2xl font-bold focus:outline-none"
              aria-label="Fermer"
            >
              &times;
            </button>
            {/* Filters Panel Content */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filtres</h2>
                <button
                  onClick={resetFilters}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center gap-2"
                >
                  <FiX /> Réinitialiser
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Toutes les Catégories</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Prix Min (€)
                  </label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Prix Max (€)
                  </label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Stock Min
                  </label>
                  <input
                    type="number"
                    value={filters.minStock}
                    onChange={(e) => handleFilterChange('minStock', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Stock Max
                  </label>
                  <input
                    type="number"
                    value={filters.maxStock}
                    onChange={(e) => handleFilterChange('maxStock', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Trier par
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="createdAt">Date de création</option>
                    <option value="price">Prix</option>
                    <option value="name">Nom</option>
                    <option value="stock">Stock</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Ordre
                  </label>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="desc">Décroissant</option>
                    <option value="asc">Croissant</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 mb-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Table for medium and up */}
            <div className="overflow-x-auto hidden sm:block">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produit
                    </th>
                    <th className="px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catégorie
                    </th>
                    <th className="px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix
                    </th>
                    <th className="px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-2 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                  {products.map((product) => (
                    <tr
                      key={product._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="px-2 md:px-4 py-3 align-top">
                        <div className="flex items-center">
                          {product.images[0] && (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-10 w-10 rounded-lg object-cover mr-3 flex-shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {product.name.split(' ').slice(0, 3).join(' ')}
                              {product.name.split(' ').length > 3 ? '...' : ''}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {product.description.substring(0, 50)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 md:px-4 py-3 align-top">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {product.category?.name}
                        </div>
                      </td>
                      <td className="px-2 md:px-4 py-3 align-top">
                        <div className="text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                          {product.price.toFixed(2)} €
                        </div>
                      </td>
                      <td className="px-2 md:px-4 py-3 align-top">
                        <div className="text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                          {product.stock}
                        </div>
                      </td>
                      <td className="px-2 md:px-4 py-3 align-top">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedProduct(product)
                              setModalOpen(true)
                              console.log('Modal should open', product)
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1"
                            title="Afficher les détails"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(product)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1"
                            title="Modifier"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1"
                            title="Supprimer"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Cards for mobile */}
            <div className="sm:hidden space-y-4">
              {products.map((product, idx) => (
                <React.Fragment key={product._id}>
                  <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      {product.images[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-14 w-14 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {product.name.split(' ').slice(0, 3).join(' ')}
                          {product.name.split(' ').length > 3 ? '...' : ''}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {product.description.substring(0, 50)}...
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Catégorie</div>
                        <div className="text-sm text-gray-900 dark:text-gray-100">{product.category?.name}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Prix</div>
                        <div className="text-sm text-gray-900 dark:text-gray-100">{product.price.toFixed(2)} €</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Stock</div>
                        <div className="text-sm text-gray-900 dark:text-gray-100">{product.stock}</div>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <button
                          onClick={() => {
                            setSelectedProduct(product)
                            setModalOpen(true)
                            console.log('Modal should open', product)
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1"
                          title="Afficher les détails"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(product)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1"
                          title="Modifier"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1"
                          title="Supprimer"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {idx !== products.length - 1 && (
                    <div className="w-full h-3 flex items-center justify-center">
                      <div className="w-11/12 h-1 bg-gray-200 dark:bg-gray-800 rounded shadow-sm"></div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            Précédent
          </button>
          <span className="px-4 py-2">
            Page {page} sur {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      )}

      {/* Modal */}
      {modalOpen && selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setModalOpen(false)} />
      )}

      {/* Edit Modal */}
      {editModalOpen && productToEdit && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center min-h-screen py-4 backdrop-blur-sm bg-black/40" onClick={() => setEditModalOpen(false)}>
          <div
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md mx-2 p-6 relative animate-fade-in max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setEditModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 text-2xl font-bold focus:outline-none"
              aria-label="Fermer"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Modifier le Produit</h2>
            <div className="space-y-3">
              <input
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={editForm.name}
                onChange={e => handleEditChange('name', e.target.value)}
                placeholder="Nom du produit"
              />
              <input
                type="number"
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={editForm.price}
                onChange={e => handleEditChange('price', e.target.value)}
                placeholder="Prix (€)"
              />
              <select
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={editForm.category}
                onChange={e => handleEditChange('category', e.target.value)}
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              <input
                type="number"
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={editForm.stock}
                onChange={e => handleEditChange('stock', e.target.value)}
                placeholder="Stock"
              />
              <textarea
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"
                value={editForm.description}
                onChange={e => handleEditChange('description', e.target.value)}
                placeholder="Description"
              />
            </div>
            <button
              onClick={handleEditSave}
              disabled={editLoading}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition disabled:opacity-60"
            >
              {editLoading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      )}

    </div>
  )
}