export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
  
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
        method: 'POST',
        body: formData
      });
      return await res.json();
    } catch (err) {
      console.error('Upload failed:', err);
      return null;
    }
  };