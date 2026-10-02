import { useEffect, useState, type ReactNode } from 'react'
import { products } from '../data/products'
import { StoreContext } from './StoreContext'
import type { CartItem, Product } from '../types'

const CART_STORAGE_KEY = 'latelier-scent-cart'
const WISHLIST_STORAGE_KEY = 'latelier-scent-wishlist'

function restoreCart(): CartItem[] {
  try {
    const stored: unknown = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? '[]')
    if (!Array.isArray(stored)) return []

    return stored.flatMap((entry: unknown) => {
      if (typeof entry !== 'object' || entry === null) return []
      const savedItem = entry as { productId?: unknown; quantity?: unknown }
      if (typeof savedItem.productId !== 'string' || typeof savedItem.quantity !== 'number' || !Number.isInteger(savedItem.quantity) || savedItem.quantity < 1) return []
      const product = products.find((item) => item.id === savedItem.productId)
      return product ? [{ product, quantity: savedItem.quantity }] : []
    })
  } catch {
    return []
  }
}

function restoreWishlist(): string[] {
  try {
    const stored: unknown = JSON.parse(window.localStorage.getItem(WISHLIST_STORAGE_KEY) ?? '[]')
    if (!Array.isArray(stored)) return []
    return [...new Set(stored.filter((id): id is string => typeof id === 'string' && products.some((product) => product.id === id)))]
  } catch {
    return []
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(restoreCart)
  const [wishlistIds, setWishlistIds] = useState<string[]>(restoreWishlist)

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems.map(({ product, quantity }) => ({ productId: product.id, quantity }))))
    } catch {
      // Keep the in-memory cart available if browser storage is disabled.
    }
  }, [cartItems])

  useEffect(() => {
    try {
      window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds))
    } catch {
      // Keep the in-memory wishlist available if browser storage is disabled.
    }
  }, [wishlistIds])

  const addToCart = (product: Product, quantity = 1) => {
    const amount = Math.max(1, Math.floor(quantity))
    setCartItems((items) => {
      const existing = items.find((item) => item.product.id === product.id)
      return existing
        ? items.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + amount } : item)
        : [...items, { product, quantity: amount }]
    })
  }

  const changeQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return
    setCartItems((items) => items.map((item) => item.product.id === productId ? { ...item, quantity: Math.floor(quantity) } : item))
  }

  const removeFromCart = (productId: string) => {
    setCartItems((items) => items.filter((item) => item.product.id !== productId))
  }

  const toggleWishlist = (productId: string) => {
    setWishlistIds((ids) => ids.includes(productId) ? ids.filter((id) => id !== productId) : [...ids, productId])
  }

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0)

  return (
    <StoreContext.Provider value={{ cartItems, cartCount, addToCart, changeQuantity, removeFromCart, wishlistIds, toggleWishlist }}>
      {children}
    </StoreContext.Provider>
  )
}

