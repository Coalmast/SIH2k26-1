// import { api } from '../services/api';
// Assuming api exists, using a mock for now
const api = {
  post: async (url: string, data: any, config?: any) => ({ data: { url: `https://mock-storage.com/${Date.now()}.jpg` } })
};

export class MediaUploader {
  /**
   * Uploads an array of local URIs and returns an array of remote URLs
   */
  static async uploadPhotos(uris: string[]): Promise<string[]> {
    if (!uris || uris.length === 0) return [];

    const uploadedUrls: string[] = [];

    for (const uri of uris) {
      try {
        // In a real implementation with React Native, we'd use FormData
        // const formData = new FormData();
        // formData.append('file', {
        //   uri,
        //   name: `photo_${Date.now()}.jpg`,
        //   type: 'image/jpeg',
        // } as any);
        
        // const response = await api.post('/api/v1/upload', formData, {
        //   headers: { 'Content-Type': 'multipart/form-data' },
        // });
        
        // uploadedUrls.push(response.data.url);
        
        // Mock successful upload:
        console.log(`[MediaUploader] Uploaded ${uri}`);
        uploadedUrls.push(`https://mock-storage.com/photo_${Date.now()}.jpg`);
        
      } catch (error) {
        console.error(`[MediaUploader] Failed to upload photo ${uri}:`, error);
        // Depending on requirements, we might want to throw or continue.
        // For robustness in sync, continuing with successful ones might be better,
        // but we'll throw to ensure data integrity for this implementation.
        throw error;
      }
    }

    return uploadedUrls;
  }
}
