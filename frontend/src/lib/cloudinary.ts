import * as cloudinary from "cloudinary"

const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
}

cloudinary.v2.config(cloudinaryConfig)

export async function uploadToCloudinary(file: File, options: {
  resource_type: 'image' | 'video' | 'raw' | 'auto'
  folder: string
}) {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'default')
    formData.append('folder', options.folder)
    formData.append('resource_type', options.resource_type)

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      throw new Error(`Cloudinary upload failed: ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    console.error("Cloudinary upload error:", error)
    throw new Error("Failed to upload file to Cloudinary")
  }
}
