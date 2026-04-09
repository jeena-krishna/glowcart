import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { orderAPI } from '../api/services'
import { ArrowLeft, Loader2, MapPin, Package } from 'lucide-react'

const statusColors = {
  PENDING: 'bg-amber-50 text-amber-700',
  PAYMENT_PROCESSING: 'bg-blue-50 text-blue-700',
  PAID: 'bg-green-50 text-green-700',
  SHIPPED: 'bg-purple-50 text-purple-700',
  DELIVERED: 'bg-emerald-50 text-emerald-700',
  CANCELLED: 'bg-red-50 text-red-700',
  REFUNDED: 'bg-gray-50 text-gray-700',
}

export default function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await orderAPI.getById(id)
        setOrder(response.data)
      } catch {
        setOrder(null)
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-4">Order not found</h1>
        <Link to="/orders" className="text-primary font-medium">← Back to orders</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/orders" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" />
        Back to orders
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Order #{order.id}</h1>
          <p className="text-sm text-text-secondary mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </div>
        <span className={`self-start text-sm font-medium px-4 py-2 rounded-full ${statusColors[order.status]}`}>
          {order.status}
        </span>
      </div>

      {/* Shipping Address */}
      {order.shippingAddress && (
        <div className="bg-surface rounded-2xl border border-border p-6 mb-6">
          <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Shipping Address
          </h2>
          <p className="text-sm text-text-secondary">{order.shippingAddress}</p>
        </div>
      )}

      {/* Items */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden mb-6">
        <div className="p-6 border-b border-border">
          <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider flex items-center gap-2">
            <Package className="w-4 h-4" />
            Items ({order.items?.length})
          </h2>
        </div>
        <div className="divide-y divide-border">
          {order.items?.map((item) => (
            <div key={item.id} className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">{item.productBrand}</p>
                <Link
                  to={`/products/${item.productId}`}
                  className="text-sm font-medium text-text-primary hover:text-primary transition-colors"
                >
                  {item.productName}
                </Link>
                <p className="text-xs text-text-secondary mt-1">
                  ${item.priceAtPurchase?.toFixed(2)} × {item.quantity}
                </p>
              </div>
              <span className="font-semibold text-text-primary">
                ${item.subtotal?.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="bg-surface rounded-2xl border border-border p-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-text-primary">Total</span>
          <span className="text-2xl font-bold text-text-primary">${order.totalAmount?.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}