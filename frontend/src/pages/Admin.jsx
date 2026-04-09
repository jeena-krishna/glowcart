import { useState, useEffect } from 'react'
import { productAPI } from '../api/services'
import { Plus, Pencil, Trash2, Loader2, X, Search, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Admin() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const emptyForm = {
    name: '',
    brand: '',
    price: '',
    description: '',
    productType: '',
    category: '',
    imageUrl: '',
    productLink: '',
    ingredients: '',
    stockQuantity: '',
    featured: false,
  }

  const [form, setForm] = useState(emptyForm)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = { page, size: 10, sortBy: 'name', direction: 'asc' }
      if (search) params.search = search
      const response = await productAPI.getAll(params)
      setProducts(response.data.content)
      setTotalPages(response.data.totalPages)
      setTotalElements(response.data.totalElements)
    } catch {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [page, search])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const openCreateModal = () => {
    setEditingProduct(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEditModal = (product) => {
    setEditingProduct(product)
    setForm({
      name: product.name || '',
      brand: product.brand || '',
      price: product.price?.toString() || '',
      description: product.description || '',
      productType: product.productType || '',
      category: product.category || '',
      imageUrl: product.imageUrl || '',
      productLink: product.productLink || '',
      ingredients: product.ingredients || '',
      stockQuantity: product.stockQuantity?.toString() || '',
      featured: product.featured || false,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.name || !form.price || !form.stockQuantity) {
      toast.error('Name, price, and stock quantity are required')
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stockQuantity: parseInt(form.stockQuantity),
      }

      if (editingProduct) {
        await productAPI.update(editingProduct.id, payload)
        toast.success('Product updated')
      } else {
        await productAPI.create(payload)
        toast.success('Product created')
      }

      setShowModal(false)
      fetchProducts()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return

    setDeleting(product.id)
    try {
      await productAPI.delete(product.id)
      toast.success('Product deleted')
      fetchProducts()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete product')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Admin Dashboard</h1>
          <p className="text-text-secondary text-sm mt-1">Manage {totalElements} products</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-rose-50/50">
                  <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Product</th>
                  <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Brand</th>
                  <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Type</th>
                  <th className="text-right text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Price</th>
                  <th className="text-right text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Stock</th>
                  <th className="text-center text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Featured</th>
                  <th className="text-right text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-rose-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-rose-50 overflow-hidden flex-shrink-0">
                          <img
                            src={product.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&size=80&background=F2E0DC&color=9E6B63`}
                            alt=""
                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&size=80&background=F2E0DC&color=9E6B63` }}
                            className="w-full h-full object-contain p-1"
                          />
                        </div>
                        <span className="text-sm font-medium text-text-primary truncate max-w-[200px]">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{product.brand || '—'}</td>
                    <td className="px-6 py-4">
                      {product.productType && (
                        <span className="text-xs bg-rose-50 text-primary-dark px-2 py-1 rounded-full">
                          {product.productType.replace(/_/g, ' ')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-text-primary text-right">
                      ${product.price?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-sm font-medium ${product.stockQuantity > 0 ? 'text-success' : 'text-error'}`}>
                        {product.stockQuantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {product.featured && (
                        <span className="text-xs bg-secondary-light text-secondary px-2 py-1 rounded-full">Yes</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/5 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          disabled={deleting === product.id}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-error hover:bg-error/5 transition-colors disabled:opacity-50"
                        >
                          {deleting === product.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <p className="text-sm text-text-muted">
                Page {page + 1} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="px-3 py-1.5 rounded-lg border border-border text-sm text-text-secondary hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-1.5 rounded-lg border border-border text-sm text-text-secondary hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-text-primary">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Price *</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    step="0.01"
                    min="0.01"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Product Type</label>
                  <input
                    type="text"
                    name="productType"
                    value={form.productType}
                    onChange={handleChange}
                    placeholder="e.g., lipstick, foundation"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={form.stockQuantity}
                    onChange={handleChange}
                    min="0"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Image URL</label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={form.imageUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-1">Product Link</label>
                  <input
                    type="url"
                    name="productLink"
                    value={form.productLink}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-1">Ingredients</label>
                  <textarea
                    name="ingredients"
                    value={form.ingredients}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={form.featured}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-text-primary">Featured product</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 rounded-xl border border-border text-sm font-medium text-text-secondary hover:border-primary hover:text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}