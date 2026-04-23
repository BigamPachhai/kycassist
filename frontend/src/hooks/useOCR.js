import { useState, useCallback } from 'react';

// ── Image compression (Canvas API — no secrets involved) ──────────────────────

/**
 * Resize to max 1024px width and convert to JPEG.
 * Reduces a 5MB photo to ~300–800KB before sending to backend.
 */
const compressImage = (file, maxWidth = 1024, quality = 0.82) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('Compression failed')),
        'image/jpeg',
        quality,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
    img.src = url;
  });

// ── Hook ─────────────────────────────────────────────────────────────────────

export const useOCR = () => {
  const [ocrLoading,  setOcrLoading]  = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrError,    setOcrError]    = useState(null);
  const [uploadedUrls, setUploadedUrls] = useState([]);

  const extractFromImages = useCallback(async (imageFile, documentType = 'citizenship') => {
    setOcrLoading(true);
    setOcrError(null);
    setOcrProgress(0);
    setUploadedUrls([]);

    try {
      // ── Step 1: Compress locally (Canvas, no network, no secrets) ──────────
      setOcrProgress(10);
      const compressedFile = await compressImage(imageFile);
      const sizeMB = (compressedFile.size / 1024 / 1024).toFixed(2);
      console.debug(`[OCR] Compressed: ${sizeMB} MB`);
      setOcrProgress(30);

      // ── Step 2: Send to backend — backend handles Cloudinary + OCR.space ───
      // All API keys stay on the server; the browser never sees them.
      const token = localStorage.getItem('kycassist_token');
      const formData = new FormData();
      formData.append('document', compressedFile, `${Date.now()}_kyc.jpg`);
      formData.append('documentType', documentType);

      setOcrProgress(50);

      const res = await fetch(
        '/api/ocr/extract',
        {
          method:  'POST',
          headers: { Authorization: `Bearer ${token}` },
          body:    formData,
          // ⚠️ Do NOT set Content-Type — browser sets it with the boundary automatically
        },
      );

      setOcrProgress(85);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Server error: ${res.status}`);
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'OCR failed');

      setUploadedUrls(data.imageUrl ? [data.imageUrl] : []);
      setOcrProgress(100);

      return {
        extracted:  data.extracted  || {},
        rawText:    data.rawText    || '',
        confidence: data.confidence ?? 85,
        imageUrl:   data.imageUrl   || null,
      };
    } catch (err) {
      console.error('[OCR] Error:', err.message);
      const friendly =
        err.message.includes('Failed to fetch') || err.message.includes('NetworkError')
          ? '🌐 Cannot connect to server. Is the backend running?'
          : `OCR failed: ${err.message}`;
      setOcrError(friendly);
      return { extracted: {}, rawText: '', confidence: 0, imageUrl: null };
    } finally {
      setOcrLoading(false);
    }
  }, []);

  return { extractFromImages, ocrLoading, ocrProgress, ocrError, uploadedUrls };
};
