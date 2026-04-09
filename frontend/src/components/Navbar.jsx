import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingBag, Heart, LogOut, Menu, X, Shield, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { productAPI } from '../api/services'

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { cart } = useCart()
  const navigate = useNavigate()
  const searchRef = useRef(null)
  const debounceRef = useRef(null)

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search suggestions
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (searchQuery.trim().length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const response = await productAPI.getAll({
          search: searchQuery.trim(),
          size: 5,
          sortBy: 'name',
          direction: 'asc',
        })
        setSuggestions(response.data.content)
        setShowSuggestions(true)
      } catch {
        setSuggestions([])
      } finally {
        setSearchLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchQuery])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setShowSuggestions(false)
      setMobileMenuOpen(false)
    }
  }

  const handleSuggestionClick = (product) => {
    navigate(`/products/${product.id}`)
    setSearchQuery('')
    setShowSuggestions(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileMenuOpen(false)
  }

  const fallbackImg = (name) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=80&background=F2E0DC&color=9E6B63&font-size=0.3`

  return (
    <nav className="bg-surface border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="font-display text-2xl font-bold text-text-primary tracking-tight">
              GlowCart
            </span>
          </Link>

          {/* Search Bar — Desktop */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products, brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  className="w-full pl-10 pr-4 py-2 rounded-full bg-rose-50 border border-border text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
                {searchLoading ? (
                  <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
                ) : (
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                )}
              </div>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-surface rounded-xl border border-border shadow-lg shadow-black/5 overflow-hidden z-50">
                {suggestions.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSuggestionClick(product)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-rose-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-rose-50 overflow-hidden flex-shrink-0">
                      <img
                        src={product.imageUrl || fallbackImg(product.name)}
                        alt=""
                        onError={(e) => { e.target.src = fallbackImg(product.name) }}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{product.name}</p>
                      <p className="text-xs text-text-muted">{product.brand} · ${product.price?.toFixed(2)}</p>
                    </div>
                  </button>
                ))}
                <button
                  onClick={handleSearch}
                  className="w-full px-4 py-2.5 text-sm text-primary font-medium hover:bg-rose-50 transition-colors border-t border-border"
                >
                  View all results for "{searchQuery}"
                </button>
              </div>
            )}
          </div>

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