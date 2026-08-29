import { CartItem } from '../contexts/CartContext';

export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const generateOrderId = (): string => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `NXP-${randomNum}`;
};

export const generateCheckoutMessage = (cart: CartItem[], totalAmount: number, orderId: string): string => {
  let message = `Halo, saya ingin melakukan pemesanan di Nexphyrix Store.\n\n`;
  message += `ID Pesanan: ${orderId}\n`;
  message += `Daftar Pesanan:\n`;
  
  cart.forEach((item) => {
    // Handling case where price string might not be standard, but we show the title and original price text
    const priceText = item.price ? item.price : formatRupiah(item.priceValue);
    message += `- ${item.title} — ${priceText}\n`;
  });
  
  message += `\nTotal Produk: ${cart.length}\n`;
  message += `Total Pembayaran: ${formatRupiah(totalAmount)}\n\n`;
  message += `Mohon diproses. Terima kasih.`;
  
  return message;
};

export const copyToClipboardFallback = async (text: string): Promise<boolean> => {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('Clipboard API failed', err);
    }
  }
  
  // Fallback for older browsers or non-secure contexts
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    textArea.remove();
    return successful;
  } catch (err) {
    console.error('Fallback clipboard failed', err);
    return false;
  }
};
