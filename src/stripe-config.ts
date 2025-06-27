// Stripe product configuration
export const products = {
  membership: {
    priceId: 'price_1Re53IARyeZPP3BxebrYo905',
    name: 'EverEase Membership',
    description: 'Ongoing support of end-of-life estate management services',
    mode: 'subscription' as const,
    trialPeriodDays: 14,
  },
};

// Helper function to get product by ID
export const getProductByPriceId = (priceId: string) => {
  return Object.values(products).find(product => product.priceId === priceId);
};

// Helper function to format price in cents to dollars
export const formatPrice = (amount: number, currency: string = 'usd') => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  });
  
  return formatter.format(amount / 100);
};