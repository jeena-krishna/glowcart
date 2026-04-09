import { Routes, Route, Link } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Products from './pages/Products'
import { Sparkles, Truck, Shield, Leaf } from 'lucide-react'

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#FFFFFF',
            color: '#2D2D2D',
            border: '1px solid #F0E6E3',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
          },
        }}
      />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<Products />} />
        </Routes>
      </Layout>
    </>
  )
}

function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-sm text-secondary font-medium uppercase tracking-widest mb-4">
              Clean Beauty Collection
            </p>
            <h1 className="text-5xl sm:text-6xl font-bold text-text-primary mb-6 leading-tight">
              Discover Your <span className="text-primary">Natural Glow</span>
            </h1>
            <p className="text-lg text-text-secondary mb-10 leading-relaxed">
              Curated beauty essentials from 40+ premium brands. Cruelty-free, 
              ethically sourced, and made for every skin type.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="bg-primary text-white px-10 py-3.5 rounded-full font-medium hover:bg-primary-dark transition-colors duration-200 text-base"
              >
                Shop All Products
              </Link>
              <Link
                to="/products?featured=true"
                className="border border-border text-text-primary px-10 py-3.5 rounded-full font-medium hover:border-primary hover:text-primary transition-colors duration-200 text-base"
              >
                View Featured
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
      </section>

      {/* Trust Badges */}
      <section className="border-y border-border bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over $50' },
              { icon: Shield, title: 'Secure Payment', desc: 'Stripe encrypted checkout' },
              { icon: Leaf, title: 'Clean Beauty', desc: 'Cruelty-free products' },
              { icon: Sparkles, title: '877+ Products', desc: 'From 40+ brands' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                  <p className="text-xs text-text-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-text-primary mb-3">Shop by Category</h2>
          <p className="text-text-secondary">Find your perfect beauty essentials</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: 'Lipstick', type: 'lipstick', emoji: '💄' },
            { name: 'Foundation', type: 'foundation', emoji: '✨' },
            { name: 'Mascara', type: 'mascara', emoji: '👁️' },
            { name: 'Blush', type: 'blush', emoji: '🌸' },
            { name: 'Nail Polish', type: 'nail_polish', emoji: '💅' },
            { name: 'Eyeshadow', type: 'eyeshadow', emoji: '🎨' },
          ].map((cat) => (
            <Link
              key={cat.type}
              to={`/products?type=${cat.type}`}
              className="group bg-surface rounded-2xl border border-border p-6 text-center hover:border-primary hover:shadow-md hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="text-3xl mb-3">{cat.emoji}</div>
              <p className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">
                {cat.name}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-primary/5 rounded-3xl p-10 sm:p-16 text-center border border-primary/10">
          <h2 className="text-3xl font-bold text-text-primary mb-4">
            Ready to Find Your Glow?
          </h2>
          <p className="text-text-secondary mb-8 max-w-md mx-auto">
            Join thousands of beauty enthusiasts. Create your account today and get access to exclusive deals.
          </p>
          <Link
            to="/register"
            className="inline-block bg-primary text-white px-10 py-3.5 rounded-full font-medium hover:bg-primary-dark transition-colors duration-200"
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </>
  )
}

export default App