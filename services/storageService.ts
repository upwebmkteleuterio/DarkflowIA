
import { supabase } from '../lib/supabase';

/**
 * Converte uma string Base64 em um objeto Blob/File para upload.
 */
const base64ToBlob = (base64: string, contentType = 'image/png') => {
  const byteString = atob(base64.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: contentType });
};

/**
 * Faz o upload de uma imagem gerada para o Supabase Storage e retorna a URL pública.
 */
export const uploadThumbnail = async (userId: string, itemId: string, base64Data: string): Promise<string> => {
  const fileName = `${userId}/${itemId}/${Date.now()}.png`;
  const blob = base64ToBlob(base64Data);

  const { data, error } = await supabase.storage
    .from('thumbnails')
    .upload(fileName, blob, {
      contentType: 'image/png',
      upsert: true
    });

  if (error) {
    console.error('[STORAGE] Erro no upload:', error);
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('thumbnails')
    .getPublicUrl(data.path);

  return publicUrl;
};
