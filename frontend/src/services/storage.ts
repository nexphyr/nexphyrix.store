import { supabase } from '../lib/supabase';

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Link {
  id: number;
  title: string;
  url?: string;
  urls?: string[];
  status?: string;
  description: string;
  price?: string;
  category_id: number;
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
  updateCategory: async (id: number, name: string): Promise<void> => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const { error } = await supabase.from('categories').update({ name, slug }).eq('id', id);
    if (error) console.error('Error updating category:', error);
  },
  deleteCategory: async (id: number): Promise<boolean> => {
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
        return [];
      }

      // Map link_secrets back to url/urls
      return (data || []).map(link => ({
        ...link,
        url: link.link_secrets?.[0]?.url || '',
        urls: link.link_secrets?.map((s: any) => s.url) || []
      }));
    } else {
      // Public gets only links (no secrets)
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .order('created_at', { ascending: false });
        
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
      const secretData = urlsToInsert.map(u => ({ link_id: insertedLink.id, url: u }));
      const { error: secretError } = await supabase.from('link_secrets').insert(secretData);
      if (secretError) {
        console.error('Error adding secrets:', secretError);
        throw new Error(secretError.message || 'Gagal menyimpan URL rahasia.');
      }
    }
  },
  updateLink: async (id: number, data: Omit<Link, 'id' | 'created_at'>): Promise<void> => {
    const { url, urls, ...linkData } = data;
    
    // Update link
    const { error: linkError } = await supabase.from('links').update(linkData).eq('id', id);
    if (linkError) {
      console.error('Error updating link:', linkError);
      throw new Error(linkError.message || 'Gagal mengubah link.');
    }

    // Update secrets: Since multiple URLs are supported, simplest way is delete old and insert new.
    // If cascade is not enabled or if we just manage it:
    await supabase.from('link_secrets').delete().eq('link_id', id);
    
    const urlsToInsert = urls && urls.length > 0 ? urls : (url ? [url] : []);
    if (urlsToInsert.length > 0) {
      const secretData = urlsToInsert.map(u => ({ link_id: id, url: u }));
      const { error: secretError } = await supabase.from('link_secrets').insert(secretData);
      if (secretError) {
        console.error('Error updating secrets:', secretError);
        throw new Error(secretError.message || 'Gagal memperbarui URL rahasia.');
      }
    }
  },
  deleteLink: async (id: number): Promise<void> => {
    // RLS or cascade should handle link_secrets. We try deleting secrets first just in case there's no cascade.
    await supabase.from('link_secrets').delete().eq('link_id', id);
    const { error } = await supabase.from('links').delete().eq('id', id);
    if (error) {
      console.error('Error deleting link:', error);
      throw new Error(error.message || 'Gagal menghapus link.');
    }
  },
};

export const sanitizeForSQLi = (input: string): string => {
  return input;
};
