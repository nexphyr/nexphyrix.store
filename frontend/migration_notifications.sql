-- 1. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

-- 3. Trigger Function: New Member
CREATE OR REPLACE FUNCTION notify_new_member()
RETURNS TRIGGER AS $$
BEGIN
    -- Welcome message for the new user
    INSERT INTO public.notifications (user_id, title, message)
    VALUES (NEW.id, 'Selamat Datang!', 'Terima kasih telah bergabung di Nexphyrix Store. Dapatkan berbagai promo menarik khusus member!');

    -- Notification for admins
    INSERT INTO public.notifications (user_id, title, message)
    SELECT id, 'Member Baru Bergabung', 'Pengguna baru (' || COALESCE(NEW.full_name, NEW.email) || ') telah bergabung menjadi member.'
    FROM public.profiles 
    WHERE role = 'admin';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_user_profile_created ON public.profiles;
CREATE TRIGGER on_new_user_profile_created
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_member();

-- 4. Trigger Function: New Game
CREATE OR REPLACE FUNCTION notify_new_game()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notifications (user_id, title, message)
    SELECT id, 'Game Baru: ' || NEW.title, 'Segera miliki dengan harga ' || COALESCE(NEW.price, 'Gratis') || '!'
    FROM public.profiles 
    WHERE role != 'admin';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_game_added ON public.links;
CREATE TRIGGER on_new_game_added
    AFTER INSERT ON public.links
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_game();

-- 5. Trigger Function: New Order
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
BEGIN
    -- Notification for admins
    INSERT INTO public.notifications (user_id, title, message)
    SELECT id, 'Pesanan Baru Masuk!', 'Pesanan dari ' || COALESCE(NEW.customer_name, 'Seseorang') || '. Kode: ' || NEW.id || '. Total: Rp ' || NEW.total
    FROM public.profiles 
    WHERE role = 'admin';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_order_created ON public.orders;
CREATE TRIGGER on_new_order_created
    AFTER INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_order();
