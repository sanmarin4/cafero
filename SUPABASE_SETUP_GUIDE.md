# Supabase Menu Management System - Complete Setup Guide

## ✅ **What I've Fixed**

### 1. **Enhanced Error Handling & Debugging**
- Added comprehensive console.log debugging throughout the process
- Detailed error messages show exact cause of failures
- Better validation and error reporting in the admin save function

### 2. **Improved Image Upload Process**
- Automatic storage bucket creation/validation
- Enhanced error handling for upload failures
- Proper public URL generation and validation
- Development mode fallback when Supabase isn't configured

### 3. **Robust Database Operations**
- Enhanced CRUD operations with better error reporting
- Automatic cleanup on failed operations
- Real-time subscription for instant UI updates
- Proper handling of variations and add-ons

### 4. **Production-Ready Code**
- Comprehensive validation of all inputs
- Transaction-like behavior (cleanup on errors)
- Environment variable validation
- Fallback modes for development

## 🔧 **Supabase Setup Requirements**

### **Step 1: Create Your Supabase Project**
1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Wait for it to be ready (usually 2-3 minutes)

### **Step 2: Get Your Credentials**
1. Go to **Settings** → **API**
2. Copy your **Project URL** and **Anon Public Key**
3. Update your `.env` file:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### **Step 3: Create Required Database Tables**

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable Row Level Security
ALTER TABLE IF EXISTS public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.add_ons ENABLE ROW LEVEL SECURITY;

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu items table
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    popular BOOLEAN DEFAULT false,
    available BOOLEAN DEFAULT true,
    image_url TEXT,
    discount_price DECIMAL(10,2),
    discount_start_date TIMESTAMPTZ,
    discount_end_date TIMESTAMPTZ,
    discount_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (category) REFERENCES categories(id)
);

-- Variations table
CREATE TABLE IF NOT EXISTS public.variations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID NOT NULL,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

-- Add-ons table
CREATE TABLE IF NOT EXISTS public.add_ons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID NOT NULL,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    category TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

-- Insert default categories
INSERT INTO public.categories (id, name, icon, sort_order) VALUES
('dim-sum', 'Dim Sum', '🥟', 1),
('hot-coffee', 'Hot Coffee', '☕', 2),
('iced-coffee', 'Iced Coffee', '🧊', 3),
('specialty-drinks', 'Specialty Drinks', '🍹', 4),
('pastries', 'Pastries', '🥐', 5),
('sandwiches', 'Sandwiches', '🥪', 6)
ON CONFLICT (id) DO NOTHING;

-- Create RLS Policies (Allow all operations for now - customize as needed)
CREATE POLICY "Allow all operations on categories" ON public.categories FOR ALL USING (true);
CREATE POLICY "Allow all operations on menu_items" ON public.menu_items FOR ALL USING (true);
CREATE POLICY "Allow all operations on variations" ON public.variations FOR ALL USING (true);
CREATE POLICY "Allow all operations on add_ons" ON public.add_ons FOR ALL USING (true);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### **Step 4: Set Up Storage**

The app will automatically create the storage bucket, but you can do it manually:

1. Go to **Storage** in your Supabase dashboard
2. Create a new bucket called `menu-images`
3. Make it **Public**
4. Set size limit to **5MB**
5. Allow image file types: JPEG, PNG, WebP, GIF

## 🐛 **Debugging Your Setup**

### **1. Check Console Logs**
Open browser developer tools (F12) and look for:
- `=== STARTING SAVE PROCESS ===`
- `=== UPLOADING IMAGE TO SUPABASE ===`
- `=== ADD MENU ITEM START ===`

### **2. Common Error Messages & Solutions**

**"Permission denied"**
- Check your RLS policies in Supabase
- Make sure your anon key has correct permissions

**"Database error: relation does not exist"**
- You haven't created the database tables yet
- Run the SQL from Step 3 above

**"JWT expired" or "Invalid JWT"**
- Check your Supabase URL and anon key in `.env`
- Restart your development server after updating `.env`

**"Upload failed: The resource was not found"**
- Storage bucket doesn't exist
- Create it manually or check bucket permissions

**"violates row-level security policy"**
- Your RLS policies are too restrictive
- Use the policies from Step 3 or adjust as needed

### **3. Test Your Connection**

Add this temporary code to test your Supabase connection:

```javascript
// Add this to your browser console to test
import { supabase } from './src/lib/supabase';

// Test database connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('categories').select('*').limit(1);
    console.log('Database test:', { data, error });
  } catch (err) {
    console.error('Connection failed:', err);
  }
};

testConnection();
```

## 🚀 **How to Use the Updated System**

### **Admin Features:**
1. **Go to `/admin`** and login (password: `admin123`)
2. **Add Categories** first (if not using defaults)
3. **Add Menu Items:**
   - Fill in name, description, price
   - Select category
   - Upload image (will go to Supabase Storage)
   - Add variations and add-ons if needed
   - Click Save

### **Real-Time Updates:**
- Changes appear instantly on the main website
- Multiple admins can work simultaneously
- Auto-refresh when database changes occur

### **Image Management:**
- Images are stored in Supabase Storage
- Public URLs are saved in database
- Old images are automatically deleted when items are removed

## 🔒 **Security Notes**

The current setup uses permissive RLS policies for development. For production:

1. **Restrict RLS policies** to authenticated users only
2. **Add admin authentication** beyond simple password
3. **Validate file uploads** server-side
4. **Set up proper user roles** in Supabase

## 📞 **Support**

If you're still getting errors:

1. **Check the browser console** for detailed logs
2. **Verify your `.env` file** has correct Supabase credentials
3. **Ensure database tables** are created with the SQL above
4. **Check Supabase dashboard** for any error logs

The system now provides detailed error messages that will help you identify exactly what's going wrong!