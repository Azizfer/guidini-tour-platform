import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// Helper function to normalize email (trim and lowercase)
const normalizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email et code de vérification requis' },
        { status: 400 }
      );
    }
    
    // Normalize email before sending to backend
    const normalizedEmail = normalizeEmail(email);
    console.log(`Tentative de vérification du code ${otp} pour ${normalizedEmail}`);

    const response = await fetch(`${API_URL}/api/auth/verify-reset-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: normalizedEmail, otp }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Code de vérification invalide' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in verify-reset-code API route:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la vérification du code' },
      { status: 500 }
    );
  }
}
