import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react'
import { useState } from 'react'

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, loading } = useCart()
  const [updatingId, setUpdatingId] = useState(null)

  const handleUpdateQuantity = async (productId, newQuantity) => {
    setUpdatingId(productId)
    await updateQuantity(productId, newQuantity)
    setUpdatingId(null)
  }

  const handleRemove = async (productId) => {
    setUpdatingId(productId)
    await removeFromCart(productId)
    setUpdatingId(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-3">Your cart is empty</h1>
        <p className="text-text-secondary mb-8">Discover our beautiful collection of beauty products</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-full font-medium hover:bg-primary-dark transition-colors"
        >
          Start Shopping
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-text-primary mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="bg-surface rounded-2xl border border-border p-4 sm:p-6 flex gap-4 sm:gap-6"
            >
              {/* Image */}
              <Link to={`/products/${item.productId}`} className="flex-shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-rose-50 overflow-hidden">
                  <img
                    src={item.productImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.productName)}&size=200&background=F2E0DC&color=9E6B63`}
                    alt={item.productName}
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.productName)}&size=200&background=F2E0DC&color=9E6B63`
                    }}
                    className="w-full h-full object-contain p-2"
                  />
                </div>
              </Link>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-muted uppercase tracking-wider">
                  {item.productBrand}
                </p>
                <Link
                  to={`/products/${item.productId}`}
                  className="text-sm sm:text-base font-medium text-text-primary hover:text-primary transition-colors line-clamp-2"
                >
                  {item.productName}
                </Link>
                <p className="text-base font-semibold text-text-primary mt-1">
                  ${item.productPrice?.toFixed(2)}
                </p>

                {/* Quantity & Remove */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                      disabled={updatingId === item.productId}
                      className="w-8 h-8 flex items-center justify-center text-text-secondary hover:bg-rose-50 transition-colors disabled:opacity-50"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-10 h-8 flex items-center justify-center text-sm font-medium text-text-primary border-x border-border">
                      {updatingId === item.productId ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        item.quantity
                      )}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                      disabled={updatingId === item.productId}
                      className="w-8 h-8 flex items-center justify-center text-text-secondary hover:bg-rose-50 transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-text-primary">
                      ${item.subtotal?.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleRemove(item.productId)}
                      disabled={updatingId === item.productId}
                      className="text-text-muted hover:text-error transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-surface rounded-2xl border border-border p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-text-primary mb-6">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Subtotal ({cart.totalItems} items)</span>
                <span className="text-text-primary font-medium">${cart.totalPrice?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Shipping</span>
                <span className="text-success font-medium">
                  {cart.totalPrice >= 50 ? 'Free' : '$5.99'}
                </span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-semibold text-text-primary">Total</span>
                <span className="font-bold text-lg text-text-primary">
                  ${(cart.totalPrice + (cart.totalPrice >= 50 ? 0 : 5.99)).toFixed(2)}
                </span>
              </div>
            </div>

            {cart.totalPrice < 50 && (
              <p className="text-xs text-text-muted mb-4 text-center">
                Add ${(50 - cart.totalPrice).toFixed(2)} more for free shipping
              </p>
            )}

            <Link
              to="/checkout"
              className="block w-full bg-primary text-white text-center py-3 rounded-xl font-medium hover:bg-primary-dark transition-colors"
            >
              Proceed to Checkout
            </Link>

            <Link
              to="/products"
              className="block w-full text-center text-sm text-text-secondary mt-3 hover:text-primary transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}