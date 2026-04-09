import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { productAPI } from '../api/services'
import ProductCard from '../components/ProductCard'
import { SlidersHorizontal, ChevronDown, Loader2, Search, X } from 'lucide-react'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [brands, setBrands] = useState([])
  const [types, setTypes] = useState([])
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')
  const debounceRef = useRef(null)

  const page = parseInt(searchParams.get('page') || '0')
  const search = searchParams.get('search') || ''
  const brand = searchParams.get('brand') || ''
  const type = searchParams.get('type') || ''
  const featured = searchParams.get('featured') || ''
  const sortBy = searchParams.get('sortBy') || 'name'
  const direction = searchParams.get('direction') || 'asc'

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [brandsRes, typesRes] = await Promise.all([
          productAPI.getBrands(),
          productAPI.getTypes(),
        ])
        setBrands(brandsRes.data)
        setTypes(typesRes.data)
      } catch {
        // silently fail
      }
    }
    fetchFilters()
  }, [])

  useEffect(() => {
    setSearchInput(search)
  }, [search])

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const params = { page, size: 20, sortBy, direction }
        if (search) params.search = search
        if (brand) params.brand = brand
        if (type) params.type = type
        if (featured) params.featured = featured

        const response = await productAPI.getAll(params)
        setProducts(response.data.content)
        setTotalPages(response.data.totalPages)
        setTotalElements(response.data.totalElements)
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [page, search, brand, type, featured, sortBy, direction])

  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value)
      } else {
        newParams.delete(key)
      }
    })
    if (!updates.hasOwnProperty('page')) {
      newParams.set('page', '0')
    }
    setSearchParams(newParams)
  }

  const handleSearchInput = (value) => {
    setSearchInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      updateParams({ search: value || null })
    }, 400)
  }

  const clearFilters = () => {
    setSearchInput('')
    setSearchParams({})
  }

  const hasActiveFilters = search || brand || type || featured

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            {search ? `Results for "${search}"` :
             brand ? brand :
             type ? type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) :
             featured ? 'Featured Products' :
             'All Products'}
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            {totalElements} product{totalElements !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={`${sortBy}-${direction}`}
              onChange={(e) => {
                const [s, d] = e.target.value.split('-')
                updateParams({ sortBy: s, direction: d, page: '0' })
              }}
              className="appearance-none bg-surface border border-border rounded-xl px-4 py-2 pr-8 text-sm text-text-primary focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Top Rated</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          </div>

          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
              filtersOpen || hasActiveFilters
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border text-text-secondary hover:border-primary'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-primary"></span>}
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {filtersOpen && (
        <div className="bg-surface rounded-2xl border border-border p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text-primary">Filters</h3>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-sm text-primary hover:text-primary-dark font-medium flex items-center gap-1">
                <X className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider">Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider">Brand</label>
              <div className="relative">
                <select
                  value={brand}
                  onChange={(e) => updateParams({ brand: e.target.value || null })}
                  className="w-full appearance-none bg-background border border-border rounded-xl px-4 py-2 pr-8 text-sm text-text-primary focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="">All Brands</option>
                  {brands.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider">Product Type</label>
              <div className="relative">
                <select
                  value={type}
                  onChange={(e) => updateParams({ type: e.target.value || null })}
                  className="w-full appearance-none bg-background border border-border rounded-xl px-4 py-2 pr-8 text-sm text-text-primary focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="">All Types</option>
                  {types.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-text-secondary mb-2">No products found</p>
          <p className="text-sm text-text-muted mb-4">Try adjusting your search or filters</p>
          <button onClick={clearFilters} className="text-sm text-primary font-medium hover:text-primary-dark">Clear all filters</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => updateParams({ page: String(page - 1) })}
                disabled={page === 0}
                className="px-4 py-2 rounded-xl border border-border text-sm font-medium text-text-secondary hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) pageNum = i
                else if (page < 3) pageNum = i
                else if (page > totalPages - 4) pageNum = totalPages - 5 + i
                else pageNum = page - 2 + i
                return (
                  <button
                    key={pageNum}
                    onClick={() => updateParams({ page: String(pageNum) })}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                      page === pageNum
                        ? 'bg-primary text-white'
                        : 'border border-border text-text-secondary hover:border-primary hover:text-primary'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                )
              })}

              <button
                onClick={() => updateParams({ page: String(page + 1) })}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 rounded-xl border border-border text-sm font-medium text-text-secondary hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}