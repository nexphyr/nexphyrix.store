import { supabase } from '../lib/supabase';

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Link {
  id: string;
  title: string;
  url?: string;
  urls?: string[];
  status?: string;
  description: string;
  price?: string;
  category_id: string;
  created_at: string;
  is_free_claim?: boolean;
  is_active?: boolean;
  image_url?: string;
}

export const storage = {
  // Categories
  getCategories: async (): Promise<Category[]> => {
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
    return data || [];
  },
  addCategory: async (name: string): Promise<void> => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const { error } = await supabase.from('categories').insert([{ name, slug }]);
    if (error) console.error('Error adding category:', error);
  },
  updateCategory: async (id: string, name: string): Promise<void> => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const { error } = await supabase.from('categories').update({ name, slug }).eq('id', id);
    if (error) console.error('Error updating category:', error);
  },
  deleteCategory: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      console.error('Error deleting category:', error);
      return false; // could be restrict constraint
    }
    return true;
  },

  // Links
  getLinks: async (isAdmin: boolean = false): Promise<Link[]> => {
    if (isAdmin) {
      // Admin gets links + secrets
      const { data, error } = await supabase
        .from('links')
        .select(`
          *,
          link_secrets (
            url
          )
        `)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching admin links:', error);
        throw new Error(error.message || 'Gagal memuat data dari Supabase.');
      }

      // Map link_secrets back to url/urls
      return (data || []).map(link => {
        // Handle case where link_secrets is somehow an object instead of array
        const secrets = Array.isArray(link.link_secrets) ? link.link_secrets : (link.link_secrets ? [link.link_secrets] : []);
        
        let parsedUrls: string[] = [];
        secrets.forEach((s: any) => {
          if (!s.url) return;
          try {
            const parsed = JSON.parse(s.url);
            if (Array.isArray(parsed)) {
              parsedUrls.push(...parsed);
            } else {
              parsedUrls.push(s.url);
            }
          } catch {
            parsedUrls.push(s.url);
          }
        });

        return {
          ...link,
          url: parsedUrls[0] || '',
          urls: parsedUrls
        };
      });
    } else {
      // Public gets only links (no secrets)
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .order('title', { ascending: true });
        
      if (error) {
        console.error('Error fetching public links:', error);
        return [];
      }
      return data || [];
    }
  },
  addLink: async (data: Omit<Link, 'id' | 'created_at'>): Promise<void> => {
    const { url, urls, ...linkData } = data;
    
    // Insert link
    const { data: insertedLink, error: linkError } = await supabase
      .from('links')
      .insert([linkData])
      .select('id')
      .single();
      
    if (linkError || !insertedLink) {
      console.error('Error adding link:', linkError);
      throw new Error(linkError?.message || 'Gagal menyimpan link. Pastikan Anda memiliki akses Admin.');
    }

    // Insert secrets
    const urlsToInsert = urls && urls.length > 0 ? urls : (url ? [url] : []);
    if (urlsToInsert.length > 0) {
      // Store all URLs as a JSON string in a single secret record to avoid unique constraint violations
      const secretData = [{ link_id: insertedLink.id, url: JSON.stringify(urlsToInsert) }];
      const { error: secretError } = await supabase.from('link_secrets').insert(secretData);
      if (secretError) {
        console.error('Error adding secrets:', secretError);
        throw new Error(secretError.message || 'Gagal menyimpan URL rahasia.');
      }
    }
  },
  updateLink: async (id: string, data: Omit<Link, 'id' | 'created_at'>): Promise<void> => {
    const { url, urls, ...linkData } = data;
    
    // Update link
    const { error: linkError } = await supabase.from('links').update(linkData).eq('id', id);
    if (linkError) {
      console.error('Error updating link:', linkError);
      throw new Error(linkError.message || 'Gagal mengubah link.');
    }

    // Update secrets
    const urlsToInsert = urls && urls.length > 0 ? urls : (url ? [url] : []);
    if (urlsToInsert.length > 0) {
      // Use upsert to overwrite existing secret for this link_id, 
      // preventing duplicate key violation when delete fails (e.g. due to RLS policies)
      const secretData = { link_id: id, url: JSON.stringify(urlsToInsert) };
      const { error: secretError } = await supabase.from('link_secrets').upsert(secretData, { onConflict: 'link_id' });
      if (secretError) {
        console.error('Error updating secrets:', secretError);
        throw new Error(secretError.message || 'Gagal memperbarui URL rahasia.');
      }
    } else {
      // If cleared, set it to empty array string
      const secretData = { link_id: id, url: "[]" };
      await supabase.from('link_secrets').upsert(secretData, { onConflict: 'link_id' });
    }
  },
  deleteLink: async (id: string): Promise<void> => {
    // RLS or cascade should handle link_secrets. We try deleting secrets first just in case there's no cascade.
    await supabase.from('link_secrets').delete().eq('link_id', id);
    const { error } = await supabase.from('links').delete().eq('id', id);
    if (error) {
      console.error('Error deleting link:', error);
      throw new Error(error.message || 'Gagal menghapus link.');
    }
  },
  deleteLinks: async (ids: string[]): Promise<void> => {
    await supabase.from('link_secrets').delete().in('link_id', ids);
    const { error } = await supabase.from('links').delete().in('id', ids);
    if (error) {
      console.error('Error deleting links:', error);
      throw new Error(error.message || 'Gagal menghapus link.');
    }
  },

  // Orders
  deleteOrder: async (id: string): Promise<void> => {
    await supabase.from('order_items').delete().eq('order_id', id);
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) {
      console.error('Error deleting order:', error);
      throw new Error(error.message || 'Gagal menghapus pesanan.');
    }
  },
  deleteOrders: async (ids: string[]): Promise<void> => {
    await supabase.from('order_items').delete().in('order_id', ids);
    const { error } = await supabase.from('orders').delete().in('id', ids);
    if (error) {
      console.error('Error deleting orders:', error);
      throw new Error(error.message || 'Gagal menghapus pesanan.');
    }
  },

  // Member - Retrieve purchased links
  getPurchasedLinks: async (orderId: string): Promise<{ product_title: string, urls: string }[]> => {
    const { data, error } = await supabase.rpc('get_purchased_links', {
      p_order_id: orderId
    });

    if (error) {
      console.error('Error fetching purchased links:', error);
      throw new Error(error.message || 'Gagal mengambil link pesanan.');
    }

    return data || [];
  },

  // Profiles
  updateProfile: async (id: string, updates: any): Promise<{ error: any }> => {
    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    return { error };
  },

  // Payment Receipts
  uploadPaymentReceipt: async (file: File, orderId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${orderId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `receipts/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('payment_receipts')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading receipt:', uploadError);
      throw new Error(uploadError.message || 'Gagal mengunggah bukti pembayaran.');
    }

    const { data } = supabase.storage
      .from('payment_receipts')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  deletePaymentReceipt: async (receiptUrl: string): Promise<void> => {
    try {
      const urlParts = receiptUrl.split('/payment_receipts/');
      if (urlParts.length === 2) {
        const filePath = urlParts[1];
        const { error } = await supabase.storage
          .from('payment_receipts')
          .remove([filePath]);
        if (error) {
          console.error('Error deleting old receipt:', error);
        }
      }
    } catch (e) {
      console.error('Failed to parse or delete old receipt', e);
    }
  },

  updateOrderReceipt: async (orderId: string, receiptUrl: string): Promise<void> => {
    // Try updating via RPC first to bypass RLS for normal users
    let rpcFailed = false;
    try {
      const { error: rpcError } = await supabase.rpc('update_order_receipt', {
        p_order_id: orderId,
        p_receipt_url: receiptUrl
      });
      if (rpcError) rpcFailed = true;
    } catch (e) {
      // If RPC doesn't exist, it might throw a CORS/NetworkError on 404
      rpcFailed = true;
    }

    if (rpcFailed) {
      // Fallback to direct update if RPC doesn't exist yet (for admin or if RLS allows)
      const { error } = await supabase
        .from('orders')
        .update({ payment_receipt_url: receiptUrl })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order receipt:', error);
        throw new Error(error.message || 'Gagal menyimpan tautan bukti pembayaran ke pesanan. Pastikan Anda telah menjalankan script SQL rpc_update_receipt.sql');
      }
    }
  },

  // Free Game Claims
  toggleFreeClaim: async (id: string, is_free_claim: boolean): Promise<void> => {
    const { error } = await supabase.from('links').update({ is_free_claim }).eq('id', id);
    if (error) throw new Error(error.message || 'Gagal mengupdate status game gratis.');
  },

  claimFreeGame: async (gameId: string): Promise<void> => {
    const { error } = await supabase.rpc('claim_free_game', { p_game_id: gameId });
    if (error) {
      console.error('Error claiming free game:', error);
      throw new Error(error.message || 'Gagal mengklaim game.');
    }
  },

  getClaimedLinks: async (): Promise<{ product_title: string, urls: string }[]> => {
    const { data, error } = await supabase.rpc('get_claimed_links');
    if (error) {
      console.error('Error fetching claimed links:', error);
      throw new Error(error.message || 'Gagal mengambil link klaim.');
    }
    return data || [];
  }
};

export const sanitizeForSQLi = (input: string): string => {
  return input;
};
