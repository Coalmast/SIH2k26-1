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
    return `mock-url-${Date.now()}.jpg`;
  }
}
