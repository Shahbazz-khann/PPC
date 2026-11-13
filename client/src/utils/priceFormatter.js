/**
 * Format price into Pakistani notation (Lac / Crore)
 * Examples:
 * 130,000,000 -> PKR 13 Crore
 * 220,000,000 -> PKR 22 Crore
 * 5,000,000   -> PKR 50 Lac
 * 58,000,000  -> PKR 5.8 Crore
 * 75,000      -> PKR 75,000
 */
export const formatPriceInWords = (amount, currency = 'PKR') => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return 'Price on Request';
  }
  const num = Number(amount);
  if (num <= 0) return 'Price on Request';

  const curr = currency || 'PKR';

  // 1 Crore = 10,000,000 (10 Million)
  if (num >= 10000000) {
    const crore = num / 10000000;
    const formatted = parseFloat(crore.toFixed(2));
    return `${curr} ${formatted} Crore`;
  }

  // 1 Lac = 100,000 (100 Thousand)
  if (num >= 100000) {
    const lac = num / 100000;
    const formatted = parseFloat(lac.toFixed(2));
    return `${curr} ${formatted} Lac`;
  }

  // Below 1 Lac: standard comma format
  return `${curr} ${num.toLocaleString('en-PK')}`;
};

export default formatPriceInWords;

