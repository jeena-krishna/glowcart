import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Star } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { wishlistAPI } from '../api/services'
import ProductImage from './ProductImage'
import toast from 'react-hot-toast'
import { useState } from 'react'

export default function ProductCard({ product, onWishlistToggle }) {
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()
  const [wishlisted, setWishlisted] = useState(product.wishlisted || false)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to cart')
      return
    }
    await addToCart(product.id)
  }

  const handleToggleWishlist = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      toast.error('Please sign in to save items')
      return
    }
    try {
      const response = await wishlistAPI.toggle(product.id)
      setWishlisted(response.data.wishlisted)
      toast.success(response.data.wishlisted ? 'Added to wishlist' : 'Removed from wishlist')
      if (onWishlistToggle) onWishlistToggle()
    } catch {
      toast.error('Failed to update wishlist')
    }
  }

  return (
    <Link to={`/products/${product.id}`} className="group">
      <div className="bg-surface rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-square bg-rose-50 overflow-hidden">
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full p-4 group-hover:scale-105 transition-transform duration-500"
          />

          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                wishlisted ? 'fill-primary text-primary' : 'text-text-muted hover:text-primary'
              }`}
            />
          </button>

          {/* Featured Badge */}
          {product.featured && (
            <div className="absolute top-3 left-3 bg-secondary text-white text-xs font-medium px-3 py-1 rounded-full">
              Featured
            </div>
          )}

          {/* Out of Stock Overlay */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="bg-text-primary text-white text-sm font-medium px-4 py-2 rounded-full">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
            {product.brand || 'GlowCart'}
          </p>
          <h3 className="text-sm font-medium text-text-primary leading-snug mb-2 line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-text-primary">
                ${product.price?.toFixed(2)}
              </span>
              {product.rating && (
                <div className="flex items-center gap-0.5 text-secondary">
                  <Star className="w-3.5 h-3.5 fill-secondary" />
                  <span className="text-xs font-medium">{product.rating}</span>
                </div>
              )}
            </div>

            {product.inStock && (
              <button
                onClick={handleAddToCart}
                className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-white text-primary transition-colors duration-200"
              >
                <ShoppingBag className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}