'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiEdit2, FiTrash2, FiPlus, FiX } from 'react-icons/fi'
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

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-100 dark:bg-gray-950 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestion des Produits</h1>
        <button
          onClick={() => router.push('/admin/products/create')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
        >
          <FiPlus /> Ajouter un Produit
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 mb-6">
        {/* Filters Panel */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Catégorie
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="desc">Décroissant</option>
                <option value="asc">Croissant</option>
              </select>
            </div>
          </div>
        </div>

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
                    <th className="px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
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
                            onClick={() => router.push(`/admin/products/${product._id}/edit`)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                            title="Modifier"
                          >
                            <FiEdit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                            title="Supprimer"
                          >
                            <FiTrash2 className="w-5 h-5" />
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
                          onClick={() => router.push(`/admin/products/${product._id}/edit`)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                          title="Modifier"
                        >
                          <FiEdit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          title="Supprimer"
                        >
                          <FiTrash2 className="w-5 h-5" />
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
      </div>
    </div>
  )
} 