import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { orderAPI } from '../api/services'
import { Loader2, Lock, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Checkout() {
  const [shippingAddress, setShippingAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const { cart, fetchCart } = useCart()
  const navigate = useNavigate()

  const handleCheckout = async (e) => {
    e.preventDefault()

    if (!shippingAddress.trim()) {
      toast.error('Please enter a shipping address')
      return
    }

    setLoading(true)
    try {
      // 1. Create order and get Stripe client secret
      const checkoutResponse = await orderAPI.checkout({ shippingAddress })
      const { orderId } = checkoutResponse.data

      // 2. For this demo, we'll confirm the order directly
      // In production, you'd use Stripe Elements to collect card details
      await orderAPI.confirm(orderId)

      // 3. Refresh cart (should be empty now)
      await fetchCart()

      toast.success('Order placed successfully!')
      navigate(`/orders/${orderId}`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Checkout failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-4">No items to checkout</h1>
        <a href="/products" className="text-primary font-medium hover:text-primary-dark">
          Continue Shopping
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-text-primary mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form */}
        <div className="lg:col-span-3">
          <form onSubmit={handleCheckout} className="space-y-6">
            {/* Shipping Address */}
            <div className="bg-surface rounded-2xl border border-border p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Shipping Address</h2>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Enter your full shipping address..."
                rows={3}
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
              />
            </div>

            {/* Payment Info */}
            <div className="bg-surface rounded-2xl border border-border p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment
              </h2>
              <div className="bg-rose-50 rounded-xl p-4 border border-primary/10">
                <p className="text-sm text-text-secondary">
                  This is a demo checkout using Stripe test mode. No real charges will be made.
                  In the full version, Stripe Elements would collect card details here.
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
                  <Lock className="w-3 h-3" />
                  Secured by Stripe
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-xl font-medium hover:bg-primary-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing order...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Place Order — ${cart.totalPrice?.toFixed(2)}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-surface rounded-2xl border border-border p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-text-secondary truncate pr-2">
                    {item.productName} × {item.quantity}
                  </span>
                  <span className="text-text-primary font-medium flex-shrink-0">
                    ${item.subtotal?.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Subtotal</span>
                <span className="text-text-primary">${cart.totalPrice?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Shipping</span>
                <span className="text-success">{cart.totalPrice >= 50 ? 'Free' : '$5.99'}</span>
              </div>
              <div className="flex justify-between font-semibold text-text-primary pt-2 border-t border-border">
                <span>Total</span>
                <span>${(cart.totalPrice + (cart.totalPrice >= 50 ? 0 : 5.99)).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}