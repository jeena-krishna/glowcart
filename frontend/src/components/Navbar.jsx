import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingBag, Heart, User, LogOut, Menu, X, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { cart } = useCart()
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setMobileMenuOpen(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileMenuOpen(false)
  }

  return (
    <nav className="bg-surface border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-2xl font-bold text-text-primary tracking-tight">
              GlowCart
            </span>
          </Link>

          {/* Search Bar — Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-rose-50 border border-border text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            </div>
          </form>

          {/* Right Actions — Desktop */}
          <div className="hidden md:flex items-center gap-5">
            <Link to="/products" className="text-sm text-text-secondary hover:text-primary transition-colors font-medium">
              Shop
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/wishlist" className="relative text-text-secondary hover:text-primary transition-colors">
                  <Heart className="w-5 h-5" />
                </Link>
                <Link to="/cart" className="relative text-text-secondary hover:text-primary transition-colors">
                  <ShoppingBag className="w-5 h-5" />
                  {cart.totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                      {cart.totalItems}
                    </span>
                  )}
                </Link>
                <Link to="/orders" className="text-sm text-text-secondary hover:text-primary transition-colors font-medium">
                  Orders
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="text-text-secondary hover:text-secondary transition-colors">
                    <Shield className="w-5 h-5" />
                  </Link>
                )}
                <div className="flex items-center gap-3 pl-3 border-l border-border">
                  <span className="text-sm text-text-secondary">
                    Hi, {user.firstName}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-text-muted hover:text-error transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm text-text-secondary hover:text-primary transition-colors font-medium">
                  Sign In
                </Link>
                <Link to="/register" className="bg-primary text-white text-sm px-5 py-2 rounded-full font-medium hover:bg-primary-dark transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-text-primary"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-border mt-2 pt-4">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-full bg-rose-50 border border-border text-sm focus:outline-none focus:border-primary"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              </div>
            </form>
            <div className="flex flex-col gap-3">
              <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="text-sm text-text-secondary hover:text-primary font-medium">Shop All</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="text-sm text-text-secondary hover:text-primary font-medium">Cart ({cart.totalItems})</Link>
                  <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="text-sm text-text-secondary hover:text-primary font-medium">Wishlist</Link>
                  <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="text-sm text-text-secondary hover:text-primary font-medium">Orders</Link>
                  {isAdmin && <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="text-sm text-text-secondary hover:text-primary font-medium">Admin</Link>}
                  <button onClick={handleLogout} className="text-sm text-error font-medium text-left">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-sm text-text-secondary hover:text-primary font-medium">Sign In</Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="text-sm text-primary font-medium">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}