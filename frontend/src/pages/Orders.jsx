import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { orderAPI } from '../api/services'
import { Package, Loader2, ChevronRight } from 'lucide-react'

const statusColors = {
  PENDING: 'bg-amber-50 text-amber-700',
  PAYMENT_PROCESSING: 'bg-blue-50 text-blue-700',
  PAID: 'bg-green-50 text-green-700',
  SHIPPED: 'bg-purple-50 text-purple-700',
  DELIVERED: 'bg-emerald-50 text-emerald-700',
  CANCELLED: 'bg-red-50 text-red-700',
  REFUNDED: 'bg-gray-50 text-gray-700',
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderAPI.getAll({ page: 0, size: 20 })
        setOrders(response.data.content)
      } catch {
        setOrders([])
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-6">
          <Package className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-3">No orders yet</h1>
        <p className="text-text-secondary mb-8">Start shopping and your orders will appear here</p>
        <Link
          to="/products"
          className="inline-block bg-primary text-white px-8 py-3 rounded-full font-medium hover:bg-primary-dark transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-text-primary mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="block bg-surface rounded-2xl border border-border p-6 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h3 className="font-semibold text-text-primary">Order #{order.id}</h3>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[order.status] || 'bg-gray-50 text-gray-700'}`}>
                  {order.status}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-text-muted" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">
                  {order.items?.length} item{order.items?.length !== 1 ? 's' : ''} •{' '}
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
              </div>
              <span className="text-lg font-bold text-text-primary">
                ${order.totalAmount?.toFixed(2)}
              </span>
            </div>

            {/* Item previews */}
            <div className="mt-4 flex flex-wrap gap-2">
              {order.items?.slice(0, 3).map((item) => (
                <span key={item.id} className="text-xs bg-rose-50 text-text-secondary px-3 py-1 rounded-full">
                  {item.productName}
                </span>
              ))}
              {order.items?.length > 3 && (
                <span className="text-xs text-text-muted px-2 py-1">
                  +{order.items.length - 3} more
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}