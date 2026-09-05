import { supabase } from '../lib/supabase';

export class MediaUploader {
  /**
   * Uploads an array of local URIs and returns an array of remote URLs
   */
  static async uploadPhotos(uris: string[]): Promise<string[]> {
    if (!uris || uris.length === 0) return [];

    const uploadedUrls: string[] = [];

    for (const uri of uris) {
      try {
        const url = await this.uploadSinglePhoto(uri);
        if (url) uploadedUrls.push(url);
      } catch (error) {
        console.error(`[MediaUploader] Failed to upload photo ${uri}:`, error);
        throw error;
      }
    }

    return uploadedUrls;
  }

  static async uploadSinglePhoto(uri: string): Promise<string | null> {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      
      const { data, error } = await supabase.storage
        .from('comet-evidence')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
        });
        
      if (error) throw error;
      
      const { data: publicData } = supabase.storage
        .from('comet-evidence')
        .getPublicUrl(fileName);
        
      return publicData.publicUrl;
    } catch (error) {
      console.error(`[MediaUploader] Failed to upload single photo ${uri}:`, error);
      return null;
    }
  }
}
