import type { CartItem } from '../types'

export type DeliveryDetails = {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
}

export type OrderReceipt = {
  reference: string
  subtotal: number
}

type OrderPayload = {
  reference?: string
  subtotal?: number
  error?: string
}

// Posts the order to the serverless function that sends the Mailgun emails.
// The Mailgun API key stays on the server, never in this bundle.
export async function placeOrder(details: DeliveryDetails, items: CartItem[]): Promise<OrderReceipt> {
  let response: Response
  try {
    response = await fetch('/api/send-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: details,
        items: items.map(({ product, quantity }) => ({
          id: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          quantity,
        })),
      }),
    })
  } catch {
    throw new Error('Could not reach the order service. Serving the site locally? Run `vercel dev` so the /api route is available.')
  }

  const payload = (await response.json().catch(() => null)) as OrderPayload | null

  if (!response.ok) {
    throw new Error(payload?.error ?? `The order could not be placed (status ${response.status}).`)
  }

  return {
    reference: payload?.reference ?? '',
    subtotal: payload?.subtotal ?? 0,
  }
}
