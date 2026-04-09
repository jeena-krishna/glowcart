import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { productAPI } from '../api/services'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { wishlistAPI } from '../api/services'
import ProductImage from '../components/ProductImage'
import toast from 'react-hot-toast'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [wishlisted, setWishlisted] = useState(false)
 
  const [addingToCart, setAddingToCart] = useState(false)
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      try {
        const response = await productAPI.getById(id)
        setProduct(response.data)
        setWishlisted(response.data.wishlisted || false)
      } catch {
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to cart')
      return
    }
    setAddingToCart(true)
    await addToCart(product.id, quantity)
    setAddingToCart(false)
  }

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to save items')
      return
    }
    try {
      const response = await wishlistAPI.toggle(product.id)
      setWishlisted(response.data.wishlisted)
      toast.success(response.data.wishlisted ? 'Added to wishlist' : 'Removed from wishlist')
    } catch {
      toast.error('Failed to update wishlist')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-4">Product not found</h1>
        <Link to="/products" className="text-primary font-medium hover:text-primary-dark">
          ← Back to products
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link to="/products" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" />
        Back to products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image */}
        <div className="bg-surface rounded-3xl border border-border overflow-hidden">
          <div className="aspect-square bg-rose-50">
            <ProductImage
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full p-8"
            />
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col">
          {/* Brand */}
          <p className="text-sm text-text-muted uppercase tracking-widest mb-2">
            {product.brand || 'GlowCart'}
          </p>

          {/* Name */}
          <h1 className="text-3xl font-bold text-text-primary mb-4">
            {product.name}
          </h1>

          {/* Rating & Type */}
          <div className="flex items-center gap-4 mb-6">
            {product.rating && (
              <div className="flex items-center gap-1.5">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(product.rating)
                          ? 'fill-secondary text-secondary'
                          : 'text-border'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-text-secondary">{product.rating}</span>
              </div>
            )}
            {product.productType && (
              <span className="text-xs bg-rose-50 text-primary-dark px-3 py-1 rounded-full font-medium">
                {product.productType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            )}
            {product.featured && (
              <span className="text-xs bg-secondary-light text-secondary px-3 py-1 rounded-full font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Featured
              </span>
            )}
          </div>

          {/* Price */}
          <div className="mb-6">
            <span className="text-3xl font-bold text-text-primary">
              ${product.price?.toFixed(2)}
            </span>
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            {product.inStock ? (
              <div className="flex items-center gap-2 text-success">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">In Stock ({product.stockQuantity} available)</span>
              </div>
            ) : (
              <span className="text-sm font-medium text-error">Out of Stock</span>
            )}
          </div>

          {/* Quantity & Add to Cart */}
          {product.inStock && (
            <div className="flex items-center gap-4 mb-8">
              {/* Quantity Selector */}
              <div className="flex items-center border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-text-secondary hover:bg-rose-50 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 h-10 flex items-center justify-center text-sm font-medium text-text-primary border-x border-border">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                  className="w-10 h-10 flex items-center justify-center text-text-secondary hover:bg-rose-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="flex-1 bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-dark transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {addingToCart ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShoppingBag className="w-4 h-4" />
                )}
                Add to Cart — ${(product.price * quantity).toFixed(2)}
              </button>

              {/* Wishlist */}
              <button
                onClick={handleToggleWishlist}
                className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors ${
                  wishlisted
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary'
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${
                    wishlisted ? 'fill-primary text-primary' : 'text-text-muted'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="border-t border-border pt-6">
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">
                Description
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {product.description.length > 500
                  ? product.description.substring(0, 500) + '...'
                  : product.description}
              </p>
            </div>
          )}

          {/* Ingredients */}
          {product.ingredients && (
            <div className="border-t border-border pt-6 mt-6">
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">
                Ingredients
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                {product.ingredients}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}