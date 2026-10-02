import { useEffect, useState, type ReactNode } from 'react'
import { loadProducts } from '../data/loadProducts'
import { StoreContext } from './StoreContext'
import type { CartItem, Product } from '../types'

const CART_STORAGE_KEY = 'latelier-scent-cart'
const WISHLIST_STORAGE_KEY = 'latelier-scent-wishlist'

type StoredCartLine = {
  productId: string
  quantity: number
  product?: Product
}

function isProductSnapshot(value: unknown): value is Product {
  if (typeof value !== 'object' || value === null) return false
  const product = value as Partial<Product>
  return typeof product.id === 'string'
    && typeof product.name === 'string'
    && typeof product.brand === 'string'
    && typeof product.price === 'number'
    && product.currency === 'NGN'
    && typeof product.image === 'string'
}

function restoreCart(): StoredCartLine[] {
  try {
    const stored: unknown = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? '[]')
    if (!Array.isArray(stored)) return []

    return stored.flatMap((entry: unknown) => {
      if (typeof entry !== 'object' || entry === null) return []
      const savedItem = entry as { productId?: unknown; quantity?: unknown; product?: unknown }
      if (typeof savedItem.productId !== 'string' || typeof savedItem.quantity !== 'number' || !Number.isInteger(savedItem.quantity) || savedItem.quantity < 1) return []
      return [{
        productId: savedItem.productId,
        quantity: savedItem.quantity,
        ...(isProductSnapshot(savedItem.product) ? { product: savedItem.product } : {}),
      }]
    })
  } catch {
    return []
  }
}

function restoreWishlist(): string[] {
  try {
    const stored: unknown = JSON.parse(window.localStorage.getItem(WISHLIST_STORAGE_KEY) ?? '[]')
    if (!Array.isArray(stored)) return []
    return [...new Set(stored.filter((id): id is string => typeof id === 'string'))]
  } catch {
    return []
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState<string | null>(null)
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [storedCartLines, setStoredCartLines] = useState<StoredCartLine[]>(restoreCart)
  const [storedWishlistIds, setStoredWishlistIds] = useState<string[]>(restoreWishlist)

  useEffect(() => {
    let active = true

    loadProducts()
      .then((loadedProducts) => {
        if (active) setProducts(loadedProducts)
      })
      .catch((error: unknown) => {
        if (active) setProductsError(error instanceof Error ? error.message : 'Could not load the fragrance collection.')
      })
      .finally(() => {
        if (active) setProductsLoading(false)
      })

    return () => {
      active = false
    }
  }, [loadAttempt])

  const refreshProducts = () => {
    setProductsError(null)
    setProductsLoading(true)
    setLoadAttempt((attempt) => attempt + 1)
  }

  const cartItems: CartItem[] = storedCartLines.flatMap((line) => {
    const product = products.find((item) => item.id === line.productId) ?? line.product
    if (!productsLoading && !productsError && !products.some((item) => item.id === line.productId) && !line.product) return []
    return product ? [{ product, quantity: line.quantity }] : []
  })
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0)
  const wishlistIds = productsLoading || productsError
    ? storedWishlistIds
    : storedWishlistIds.filter((id) => products.some((product) => product.id === id))

  useEffect(() => {
    if (productsLoading || productsError) return

    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems.map(({ product, quantity }) => ({ productId: product.id, quantity, product }))))
    } catch {
      // Keep the in-memory cart available if browser storage is disabled.
    }
  }, [cartItems, productsLoading, productsError])

  useEffect(() => {
    if (productsLoading || productsError) return

    try {
      window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds))
    } catch {
      // Keep the in-memory wishlist available if browser storage is disabled.
    }
  }, [wishlistIds, productsLoading, productsError])

  const addToCart = (product: Product, quantity = 1) => {
    const amount = Math.max(1, Math.floor(quantity))
    setStoredCartLines((lines) => {
      const existing = lines.find((line) => line.productId === product.id)
      return existing
        ? lines.map((line) => line.productId === product.id ? { ...line, product, quantity: line.quantity + amount } : line)
        : [...lines, { productId: product.id, product, quantity: amount }]
    })
  }

  const changeQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return
    setStoredCartLines((lines) => lines.map((line) => line.productId === productId ? { ...line, quantity: Math.floor(quantity) } : line))
  }

  const removeFromCart = (productId: string) => {
    setStoredCartLines((lines) => lines.filter((line) => line.productId !== productId))
  }

  const toggleWishlist = (productId: string) => {
    setStoredWishlistIds((ids) => ids.includes(productId) ? ids.filter((id) => id !== productId) : [...ids, productId])
  }

  return (
    <StoreContext.Provider value={{ products, productsLoading, productsError, refreshProducts, cartItems, cartCount, addToCart, changeQuantity, removeFromCart, wishlistIds, toggleWishlist }}>
      {children}
    </StoreContext.Provider>
  )
}

