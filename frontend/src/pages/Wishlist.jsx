import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { wishlistAPI } from '../api/services'
import ProductCard from '../components/ProductCard'
import { Heart, Loader2 } from 'lucide-react'

export default function Wishlist() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchWishlist = async () => {
    try {
      setLoading(true)
      const response = await wishlistAPI.get()
      setProducts(response.data)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWishlist()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-6">
          <Heart className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-3">Your wishlist is empty</h1>
        <p className="text-text-secondary mb-8">Save your favorite products to find them easily later</p>
        <Link
          to="/products"
          className="inline-block bg-primary text-white px-8 py-3 rounded-full font-medium hover:bg-primary-dark transition-colors"
        >
          Explore Products
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">My Wishlist</h1>
        <p className="text-text-secondary text-sm mt-1">{products.length} saved item{products.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onWishlistToggle={fetchWishlist}
          />
        ))}
      </div>
    </div>
  )
}