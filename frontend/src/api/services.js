import api from './client'

// ── Auth ─────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
}

// ── Products ─────────────────────────────────────────
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getBrands: () => api.get('/products/brands'),
  getTypes: () => api.get('/products/types'),
  getCategories: () => api.get('/products/categories'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
}

// ── Cart ─────────────────────────────────────────────
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart', data),
  update: (productId, quantity) =>
    api.put(`/cart/${productId}?quantity=${quantity}`),
  remove: (productId) => api.delete(`/cart/${productId}`),
  clear: () => api.delete('/cart'),
  count: () => api.get('/cart/count'),
}

// ── Wishlist ─────────────────────────────────────────
export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  toggle: (productId) => api.post(`/wishlist/${productId}`),
  check: (productId) => api.get(`/wishlist/${productId}/check`),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
}

// ── Orders ───────────────────────────────────────────
export const orderAPI = {
  checkout: (data) => api.post('/orders/checkout', data),
  confirm: (orderId) => api.post(`/orders/${orderId}/confirm`),
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
}