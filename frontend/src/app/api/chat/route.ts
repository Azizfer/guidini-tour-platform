import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Récupérer les données de la requête
    const requestData = await request.json();
    
    // URL du backend (à configurer selon votre environnement)
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001/api/chat';
    
    console.log('Relais de la requête vers le backend:', backendUrl);
    
    // Transférer la requête au backend
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });
    
    // Vérifier si la réponse est OK
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur du backend:', response.status, errorText);
      return NextResponse.json(
        { error: `Erreur du backend: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }
    
    // Récupérer les données de la réponse
    const responseData = await response.json();
    
    // Retourner la réponse
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Erreur lors du relais vers le backend:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la communication avec le backend',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
