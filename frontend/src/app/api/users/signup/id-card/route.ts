import { NextResponse } from "next/server"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("idCard")
    const userId = formData.get("userId") as string

    if (!file || typeof file !== 'object' || !('size' in file)) {
      return NextResponse.json(
        { error: "Invalid file provided" },
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
    const result = await uploadToCloudinary(file as File, {
      resource_type: file.type.startsWith("image/") ? "image" : "raw",
      folder: "guidini/documents/carteID"
    })

    return NextResponse.json({
      url: result.secure_url,
      message: "Carte d'identité téléchargée avec succès"
    })
  } catch (error) {
    console.error("Error uploading ID card:", error)
    return NextResponse.json(
      { error: "Erreur lors du téléchargement de la carte d'identité" },
      { status: 500 }
    )
  }
}
