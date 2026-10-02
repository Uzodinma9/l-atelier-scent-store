const formatters = new Map<string, Intl.NumberFormat>()

export function formatCurrency(amount: number, currency: string = 'NGN'): string {
  let formatter = formatters.get(currency)
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    })
    formatters.set(currency, formatter)
  }
  return formatter.format(amount)
}