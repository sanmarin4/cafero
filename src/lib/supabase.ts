import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Export these for use in hooks
export { supabaseUrl, supabaseAnonKey };

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables - using offline mode');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-key');

// Storage configuration
const STORAGE_BUCKET = 'menu-images';

// Storage helper functions
export const uploadImage = async (file: File, fileName: string): Promise<string | null> => {
  console.log('=== UPLOADING IMAGE TO SUPABASE ===');
  console.log('File details:', { name: file.name, size: file.size, type: file.type });
  console.log('Target filename:', fileName);
  
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase not configured - using local URL for development');
      return URL.createObjectURL(file); // Return local URL for development
    }

    // First, ensure the bucket exists
    console.log('Checking/creating storage bucket...');
    await createStorageBucket();
    
    const fileExt = file.name.split('.').pop();
    const uniqueFileName = `${fileName}-${Date.now()}.${fileExt}`;
    
    console.log('Uploading to storage...');
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(uniqueFileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
    
    if (!data || !data.path) {
      throw new Error('No upload data returned');
    }
    
    console.log('Upload successful, path:', data.path);

    // Get public URL
    console.log('Getting public URL...');
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data.path);

    if (!publicUrl) {
      throw new Error('Failed to get public URL');
    }
    
    console.log('Public URL generated:', publicUrl);
    console.log('=== IMAGE UPLOAD COMPLETED ===');
    
    return publicUrl;
  } catch (error) {
    console.error('=== IMAGE UPLOAD ERROR ===', error);
    throw error;
  }
};

export const deleteImage = async (imageUrl: string): Promise<void> => {
  console.log('=== DELETING IMAGE FROM SUPABASE ===');
  console.log('Image URL:', imageUrl);
  
  try {
    if (!supabaseUrl || !supabaseAnonKey || !imageUrl.includes('supabase')) {
      console.warn('Supabase not configured or not a Supabase image - deletion skipped');
      return;
    }

    // Extract file path from URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    
    console.log('Deleting file:', fileName);

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([fileName]);

    if (error) {
      console.error('Storage deletion error:', error);
      throw error;
    }
    
    console.log('=== IMAGE DELETION COMPLETED ===');
  } catch (error) {
    console.error('=== IMAGE DELETION ERROR ===', error);
    throw error;
  }
};

export const createStorageBucket = async (): Promise<void> => {
  console.log('=== CREATING/CHECKING STORAGE BUCKET ===');
  
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase not configured - bucket creation skipped');
      return;
    }

    // First check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      throw listError;
    }
    
    const existingBucket = buckets?.find(bucket => bucket.name === STORAGE_BUCKET);
    
    if (existingBucket) {
      console.log('Storage bucket already exists');
      return;
    }
    
    console.log('Creating new storage bucket...');
    const { error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      fileSizeLimit: 5242880 // 5MB
    });

    if (error && !error.message.includes('already exists')) {
      console.error('Bucket creation error:', error);
      throw error;
    }
    
    console.log('=== STORAGE BUCKET READY ===');
  } catch (error) {
    console.error('=== STORAGE BUCKET ERROR ===', error);
    // Don't throw here to avoid blocking the app
  }
};

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          icon: string;
          sort_order: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          icon: string;
          sort_order?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          icon?: string;
          sort_order?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      menu_items: {
        Row: {
          id: string;
          name: string;
          description: string;
          base_price: number;
          category: string;
          popular: boolean;
          available: boolean;
          image_url: string | null;
          discount_price: number | null;
          discount_start_date: string | null;
          discount_end_date: string | null;
          discount_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          base_price: number;
          category: string;
          popular?: boolean;
          available?: boolean;
          image_url?: string | null;
          discount_price?: number | null;
          discount_start_date?: string | null;
          discount_end_date?: string | null;
          discount_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          base_price?: number;
          category?: string;
          popular?: boolean;
          available?: boolean;
          image_url?: string | null;
          discount_price?: number | null;
          discount_start_date?: string | null;
          discount_end_date?: string | null;
          discount_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      variations: {
        Row: {
          id: string;
          menu_item_id: string;
          name: string;
          price: number;
          type: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          menu_item_id: string;
          name: string;
          price: number;
          type?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          menu_item_id?: string;
          name?: string;
          price?: number;
          type?: string | null;
          created_at?: string;
        };
      };
      add_ons: {
        Row: {
          id: string;
          menu_item_id: string;
          name: string;
          price: number;
          category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          menu_item_id: string;
          name: string;
          price: number;
          category: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          menu_item_id?: string;
          name?: string;
          price?: number;
          category?: string;
          created_at?: string;
        };
      };
      payment_methods: {
        Row: {
          id: string;
          name: string;
          account_number: string;
          account_name: string;
          qr_code_url: string;
          active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          account_number: string;
          account_name: string;
          qr_code_url: string;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          account_number?: string;
          account_name?: string;
          qr_code_url?: string;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      site_settings: {
        Row: {
          id: string;
          value: string;
          type: string;
          description: string | null;
          updated_at: string;
        };
        Insert: {
          id: string;
          value: string;
          type?: string;
          description?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          value?: string;
          type?: string;
          description?: string | null;
          updated_at?: string;
        };
      };
    };
  };
};