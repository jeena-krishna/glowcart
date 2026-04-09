import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { cartAPI } from '../api/services'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], totalItems: 0, totalPrice: 0 })
  const [loading, setLoading] = useState(false)
  const { isAuthenticated } = useAuth()

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [], totalItems: 0, totalPrice: 0 })
      return
    }
    try {
      setLoading(true)
      const response = await cartAPI.get()
      setCart(response.data)
    } catch {
      // silently fail — cart might not be accessible
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const addToCart = async (productId, quantity = 1) => {
    try {
      const response = await cartAPI.add({ productId, quantity })
      setCart(response.data)
      toast.success('Added to cart')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart')
    }
  }

  const updateQuantity = async (productId, quantity) => {
    try {
      const response = await cartAPI.update(productId, quantity)
      setCart(response.data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update cart')
    }
  }

  const removeFromCart = async (productId) => {
    try {
      const response = await cartAPI.remove(productId)
      setCart(response.data)
      toast.success('Removed from cart')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove item')
    }
  }

  const clearCart = async () => {
    try {
      await cartAPI.clear()
      setCart({ items: [], totalItems: 0, totalPrice: 0 })
    } catch (error) {
      toast.error('Failed to clear cart')
    }
  }

  return (
    <CartContext.Provider value={{
      cart, loading, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}