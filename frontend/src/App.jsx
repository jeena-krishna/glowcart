import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'

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
          <Route path="/" element={<TempHome />} />
        </Routes>
      </Layout>
    </>
  )
}

function TempHome() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <h1 className="text-5xl font-bold text-text-primary mb-4">
        Discover Your Glow
      </h1>
      <p className="text-xl text-text-secondary mb-8">
        Premium clean beauty products from the brands you love
      </p>
      <div className="flex gap-4 justify-center">
        <a href="/products" className="bg-primary text-white px-8 py-3 rounded-full font-medium hover:bg-primary-dark transition-colors duration-200">
          Shop Now
        </a>
        <a href="/products?featured=true" className="border border-primary text-primary px-8 py-3 rounded-full font-medium hover:bg-primary-light transition-colors duration-200">
          Featured
        </a>
      </div>
    </div>
  )
}

export default App