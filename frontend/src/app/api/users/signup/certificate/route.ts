import { NextResponse } from "next/server"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("certificate") as File
    const userId = formData.get("userId") as string

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(file, {
      resource_type: file.type.startsWith("image/") ? "image" : "raw",
      folder: "guidini/documents/CertifGuide"
    })

    return NextResponse.json({
      url: result.secure_url,
      message: "Certificat téléchargé avec succès"
    })
  } catch (error) {
    console.error("Error uploading certificate:", error)
    return NextResponse.json(
      { error: "Erreur lors du téléchargement du certificat" },
      { status: 500 }
    )
  }
}
