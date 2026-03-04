import { useState } from 'react';
import { uploadImage as supabaseUploadImage, deleteImage as supabaseDeleteImage, createStorageBucket } from '../lib/supabase';

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Initialize storage bucket on first use
  const initializeBucket = async () => {
    try {
      await createStorageBucket();
    } catch (error) {
      console.error('Error initializing storage bucket:', error);
    }
  };

  const uploadImage = async (file: File, fileType: string = 'menu-item'): Promise<string> => {
    try {
      setUploading(true);
      setUploadProgress(0);

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please upload a valid image file (JPEG, PNG, WebP, or GIF)');
      }

      // Validate file size (5MB limit for Supabase)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('Image size must be less than 5MB');
      }

      // Initialize bucket if needed
      await initializeBucket();

      // Generate a unique filename based on file type
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileName = `${fileType}-${timestamp}-${randomId}`;

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      try {
        const imageUrl = await supabaseUploadImage(file, fileName);
        
        if (!imageUrl) {
          throw new Error('Failed to get image URL after upload');
        }

        clearInterval(progressInterval);
        setUploadProgress(100);
        
        return imageUrl;
      } catch (uploadError) {
        clearInterval(progressInterval);
        throw uploadError;
      }

    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const deleteImage = async (imageUrl: string): Promise<void> => {
    try {
      await supabaseDeleteImage(imageUrl);
    } catch (error) {
      console.error('Error deleting image:', error);
      // Don't throw error for deletion failures to avoid blocking UI
    }
  };

  return {
    uploadImage,
    deleteImage,
    uploading,
    uploadProgress
  };
};