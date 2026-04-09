import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

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
      <Routes>
        <Route path="/" element={<TempHome />} />
      </Routes>
    </>
  )
}

function TempHome() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-text-primary mb-4">
          GlowCart
        </h1>
        <p className="text-xl text-text-secondary font-sans">
          Clean Beauty, Confident Glow
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <button className="bg-primary text-white px-8 py-3 rounded-full font-medium hover:bg-primary-dark transition-colors duration-200">
            Shop Now
          </button>
          <button className="border border-primary text-primary px-8 py-3 rounded-full font-medium hover:bg-primary-light transition-colors duration-200">
            Explore
          </button>
        </div>
      </div>
    </div>
  )
}

export default App