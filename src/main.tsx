import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { StoreProvider } from './store/StoreProvider'
import './index.css'
import './App.css'
import './storefront.css'
import { Storefront } from './Storefront'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <Storefront />
      </StoreProvider>
    </BrowserRouter>
  </StrictMode>,
)
