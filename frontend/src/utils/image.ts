export const resizeImageToBase64 = (file: File, size: number = 128): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = size;
      canvas.height = size;

      if (ctx) {
        const scale = Math.min(size / img.width, size / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;

        const x = (size - scaledWidth) / 2;
        const y = (size - scaledHeight) / 2;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);

        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        resolve(base64);
      } else {
        reject(new Error('Could not get canvas context'));
      }
    };

    img.onerror = () => {
      reject(new Error('Could not load image'));
    };

    img.src = URL.createObjectURL(file);
  });
};

export const validateImageFile = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return false;
  }

  if (file.size > maxSize) {
    return false;
  }

  return true;
};
