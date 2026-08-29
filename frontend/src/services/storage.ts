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
};

export const sanitizeForSQLi = (input: string): string => {
  return input;
};
