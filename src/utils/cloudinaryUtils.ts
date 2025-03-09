export const uploadImageToCloudinary = async (file: File, uploadPreset: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("cloud_name", "ddjnlhfnu"); // Replace with your Cloudinary cloud name
  
    const response = await fetch("https://api.cloudinary.com/v1_1/ddjnlhfnu/image/upload", {
      method: "POST",
      body: formData,
    });
  
    const data = await response.json();
    return data.secure_url;
  };
  