import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="font-display text-xl font-bold text-text-primary mb-3">
              GlowCart
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Your destination for clean, cruelty-free beauty products. Discover your glow.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3 uppercase tracking-wider">
              Shop
            </h4>
            <div className="flex flex-col gap-2">
              <Link to="/products" className="text-sm text-text-secondary hover:text-primary transition-colors">All Products</Link>
              <Link to="/products?featured=true" className="text-sm text-text-secondary hover:text-primary transition-colors">Featured</Link>
              <Link to="/products?type=lipstick" className="text-sm text-text-secondary hover:text-primary transition-colors">Lipstick</Link>
              <Link to="/products?type=foundation" className="text-sm text-text-secondary hover:text-primary transition-colors">Foundation</Link>
            </div>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3 uppercase tracking-wider">
              Account
            </h4>
            <div className="flex flex-col gap-2">
              <Link to="/login" className="text-sm text-text-secondary hover:text-primary transition-colors">Sign In</Link>
              <Link to="/register" className="text-sm text-text-secondary hover:text-primary transition-colors">Create Account</Link>
              <Link to="/orders" className="text-sm text-text-secondary hover:text-primary transition-colors">Order History</Link>
              <Link to="/wishlist" className="text-sm text-text-secondary hover:text-primary transition-colors">Wishlist</Link>
            </div>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3 uppercase tracking-wider">
              About
            </h4>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-text-secondary">Free shipping over $50</span>
              <span className="text-sm text-text-secondary">Cruelty-free products</span>
              <span className="text-sm text-text-secondary">Secure checkout</span>
              <span className="text-sm text-text-secondary">24/7 Support</span>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-text-muted">
            © 2026 GlowCart. All rights reserved.
          </p>
          <p className="text-xs text-text-muted flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-primary fill-primary" /> by Jeena Mole
          </p>
        </div>
      </div>
    </footer>
  )
}