import { NextResponse } from 'next/server'
import { sendContactEmail } from '@/services/emailService'

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json()

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Send email using SendGrid
    await sendContactEmail(name, email, message)

    return NextResponse.json({ message: 'Email sent successfully' })
  } catch (error) {
    console.error('Error in contact form:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
