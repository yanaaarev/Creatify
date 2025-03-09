const uploadToCloudinary = async (file: File, uploadPreset: string): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
  
    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/ddjnlhfnu/image/upload", {
        method: "POST",
        body: formData,
      });
  
      if (!res.ok) throw new Error("Failed to upload image to Cloudinary");
  
      const data = await res.json();
      return data.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw error;
    }
  };
  
  export default uploadToCloudinary;
  