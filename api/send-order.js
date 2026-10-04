// Vercel serverless function (Node runtime).
// Sends order confirmation and shop notification emails through Mailgun.
// Lives on the server so MAILGUN_API_KEY is never exposed to the browser.

import { createClient } from '@supabase/supabase-js'

const MAILGUN_API_BASE = (process.env.MAILGUN_API_BASE || 'https://api.mailgun.net').replace(/\/+$/, '')
const MAX_ITEMS = 50
const MAX_FIELD_LENGTH = 200

function cleanText(value, maxLength = MAX_FIELD_LENGTH) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]))
}

function formatAmount(amount) {
  return `NGN ${Number(amount).toLocaleString('en-NG')}`
}

function normaliseItems(items) {
  if (!Array.isArray(items)) return []
  return items.slice(0, MAX_ITEMS).flatMap((item) => {
    if (typeof item !== 'object' || item === null) return []
    const name = cleanText(item.name, 160)
    if (!name) return []
    return [{
      name,
      brand: cleanText(item.brand, 80),
      quantity: Math.max(1, Math.min(99, Math.floor(Number(item.quantity) || 1))),
      price: Math.max(0, Math.round(Number(item.price) || 0)),
    }]
  })
}

function renderLines(items) {
  return items.map((item) => ({
    line: `${item.brand ? `${item.brand} — ` : ''}${item.name} × ${item.quantity}`,
    amount: formatAmount(item.price * item.quantity),
  }))
}

function buildText({ heading, reference, customer, items, subtotal }) {
  return [
    heading,
    '',
    `Order reference: ${reference}`,
    '',
    ...renderLines(items).map(({ line, amount }) => `${line}  ${amount}`),
    '',
    `Subtotal: ${formatAmount(subtotal)}`,
    '',
    'Delivery to:',
    customer.fullName,
    customer.address,
    `${customer.city}, ${customer.state}`,
    `${customer.phone} · ${customer.email}`,
    '',
    "L'Atelier Scent · Prices in Nigerian naira",
  ].join('\n')
}

function buildHtml({ heading, reference, customer, items, subtotal }) {
  const rows = renderLines(items)
    .map(({ line, amount }) => `<tr><td style="padding:6px 0">${escapeHtml(line)}</td><td style="padding:6px 0;text-align:right">${escapeHtml(amount)}</td></tr>`)
    .join('')

  return `<div style="font-family:Georgia,serif;color:#1e231e;max-width:560px">
  <h1 style="font-size:22px;font-weight:400;margin:0 0 4px">${escapeHtml(heading)}</h1>
  <p style="margin:0 0 18px;color:#6d6f64;font-size:13px">Order reference ${escapeHtml(reference)}</p>
  <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}
    <tr><td style="padding:10px 0;border-top:1px solid #ddd;font-weight:bold">Subtotal</td><td style="padding:10px 0;border-top:1px solid #ddd;text-align:right;font-weight:bold">${escapeHtml(formatAmount(subtotal))}</td></tr>
  </table>
  <h2 style="font-size:12px;margin:22px 0 6px;text-transform:uppercase;letter-spacing:.08em">Delivery to</h2>
  <p style="margin:0;font-size:14px;line-height:1.6">${escapeHtml(customer.fullName)}<br>${escapeHtml(customer.address)}<br>${escapeHtml(customer.city)}, ${escapeHtml(customer.state)}<br>${escapeHtml(customer.phone)} · ${escapeHtml(customer.email)}</p>
  <p style="margin:24px 0 0;color:#6d6f64;font-size:12px">L'Atelier Scent · Prices in Nigerian naira</p>
</div>`
}

async function sendWithMailgun({ to, subject, text, html, replyTo }) {
  const body = new URLSearchParams()
  body.set('from', process.env.MAILGUN_FROM || `L'Atelier Scent <postmaster@${process.env.MAILGUN_DOMAIN}>`)
  for (const recipient of to) body.append('to', recipient)
  body.set('subject', subject)
  body.set('text', text)
  body.set('html', html)
  if (replyTo) body.set('h:Reply-To', replyTo)

  const response = await fetch(`${MAILGUN_API_BASE}/v3/${process.env.MAILGUN_DOMAIN}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`Mailgun responded with ${response.status}. ${detail.slice(0, 200)}`)
  }
  return response.json().catch(() => ({}))
}

// Optional: persist the order so the shop has a record beyond the email.
// Runs only when SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are configured.
async function saveOrderToSupabase(order) {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) return false

  const client = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  const { error } = await client.from('orders').insert(order)
  if (error) throw new Error(error.message)
  return true
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed.' })
  }

  if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
    return res.status(503).json({
      error: 'Email sending is not configured yet. Add MAILGUN_API_KEY and MAILGUN_DOMAIN to the server environment variables.',
    })
  }

  let payload = req.body
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload)
    } catch {
      return res.status(400).json({ error: 'The order could not be read.' })
    }
  }
  if (typeof payload !== 'object' || payload === null) {
    return res.status(400).json({ error: 'The order could not be read.' })
  }

  const rawCustomer = typeof payload.customer === 'object' && payload.customer !== null ? payload.customer : {}
  const customer = {
    fullName: cleanText(rawCustomer.fullName),
    email: cleanText(rawCustomer.email, 160),
    phone: cleanText(rawCustomer.phone, 40),
    address: cleanText(rawCustomer.address),
    city: cleanText(rawCustomer.city, 80),
    state: cleanText(rawCustomer.state, 80),
  }
  const items = normaliseItems(payload.items)

  if (!customer.fullName || !isValidEmail(customer.email) || !customer.phone || !customer.address || !customer.city || !customer.state) {
    return res.status(400).json({ error: 'Please provide a valid name, email, phone number and full delivery address.' })
  }
  if (items.length === 0) {
    return res.status(400).json({ error: 'Your cart is empty.' })
  }

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)
  const reference = `LA-${Date.now().toString(36).toUpperCase()}`

  try {
    await sendWithMailgun({
      to: [customer.email],
      subject: `Your L'Atelier Scent order ${reference}`,
      text: buildText({ heading: 'Thank you for your order', reference, customer, items, subtotal }),
      html: buildHtml({ heading: 'Thank you for your order', reference, customer, items, subtotal }),
      replyTo: process.env.ORDER_NOTIFICATION_EMAIL,
    })

    const notificationEmail = process.env.ORDER_NOTIFICATION_EMAIL
    if (notificationEmail && isValidEmail(notificationEmail)) {
      await sendWithMailgun({
        to: [notificationEmail],
        subject: `New order ${reference} — ${formatAmount(subtotal)}`,
        text: buildText({ heading: 'New order received', reference, customer, items, subtotal }),
        html: buildHtml({ heading: 'New order received', reference, customer, items, subtotal }),
        replyTo: customer.email,
      })
    }
  } catch (error) {
    return res.status(502).json({ error: error instanceof Error ? error.message : 'Could not send the order email.' })
  }

  try {
    await saveOrderToSupabase({
      reference,
      customer_name: customer.fullName,
      customer_email: customer.email,
      customer_phone: customer.phone,
      delivery_address: `${customer.address}, ${customer.city}, ${customer.state}`,
      items,
      subtotal,
      currency: 'NGN',
      status: 'received',
    })
  } catch (error) {
    console.error('Could not save the order to Supabase:', error)
  }

  return res.status(200).json({ ok: true, reference, subtotal })
}
