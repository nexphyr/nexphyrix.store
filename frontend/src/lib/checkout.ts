import { CartItem } from '../contexts/CartContext';
import { supabase } from './supabase';

export interface OrderCheckoutResult {
  order_id: string;
  order_number: string;
  total_items: number;
  subtotal: number;
  discount: number;
  total: number;
  is_member: boolean;
}

export const createOrderInDatabase = async (cart: CartItem[], method: string): Promise<OrderCheckoutResult> => {
  const items = cart.map(item => ({ id: item.id, quantity: item.quantity }));
  
  const { data, error } = await supabase.rpc('create_checkout_order', {
    p_cart_items: items,
    p_checkout_method: method
  });

  if (error) {
    console.error('Error creating order:', error);
    throw new Error(error.message || 'Gagal membuat pesanan di database.');
  }

  return data as OrderCheckoutResult;
};

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

export const generateCheckoutMessage = (
  cart: CartItem[], 
  orderData: {
    order_number: string;
    subtotal: number;
    discount: number;
    total: number;
    is_member: boolean;
  },
  checkoutMethod: string
): string => {
  let message = `Halo, saya ingin melakukan pemesanan di Nexphyrix Store.\n\n`;
  message += `ID Pesanan: ${orderData.order_number}\n`;
  message += `Daftar Pesanan:\n`;
  
  cart.forEach((item) => {
    const priceText = item.price ? item.price : formatRupiah(item.priceValue);
    message += `- ${item.title} — ${priceText}\n`;
  });
  
  message += `\nTotal Produk: ${cart.length}\n`;
  message += `Subtotal: ${formatRupiah(orderData.subtotal)}\n`;
  
  if (orderData.is_member && orderData.discount > 0) {
    message += `Diskon Member: -${formatRupiah(orderData.discount)}\n`;
  }
  
  message += `Total Pembayaran: ${formatRupiah(orderData.total)}\n\n`;
  
  const methodCapitalized = checkoutMethod.charAt(0).toUpperCase() + checkoutMethod.slice(1);
  message += `Checkout melalui: ${methodCapitalized}\n\n`;
  message += `Berikut saya lampirkan bukti pembayaran untuk pesanan ini. Mohon segera diproses. Terima kasih.`;
  
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

export const updateCheckoutMethod = async (orderId: string, method: string): Promise<void> => {
  const { error } = await supabase.rpc('update_checkout_method', {
    p_order_id: orderId,
    p_method: method
  });
  if (error) throw error;
};

export const sendTelegramNotification = async (orderData: OrderCheckoutResult, cart: CartItem[], email: string) => {
  const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) return;

  let message = `🛒 <b>Pesanan Baru Masuk!</b>\n\n`;
  message += `<b>ID Pesanan:</b> ${orderData.order_number}\n`;
  message += `<b>Email Pembeli:</b> ${email}\n\n`;
  message += `<b>Daftar Pesanan:</b>\n`;
  
  cart.forEach((item) => {
    const priceText = item.price ? item.price : formatRupiah(item.priceValue);
    message += `- ${item.title} (${priceText})\n`;
  });
  
  message += `\n<b>Total Item:</b> ${cart.length}\n`;
  if (orderData.is_member && orderData.discount > 0) {
    message += `<b>Diskon Member:</b> -${formatRupiah(orderData.discount)}\n`;
  }
  message += `<b>Total Tagihan:</b> ${formatRupiah(orderData.total)}\n`;

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
  }
};
