export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
  
    try {
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData
      });
      return await res.json();
    } catch (err) {
      console.error('Upload failed:', err);
      return null;
    }
  };