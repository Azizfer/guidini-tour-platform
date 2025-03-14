// src/app/profileGuide/components/Help.tsx

import React, { useState } from "react";

const Help = () => {
  const [name, setName] = useState<string>(""); // État pour le nom de l'utilisateur
  const [email, setEmail] = useState<string>(""); // État pour l'email de l'utilisateur (facultatif)
  const [subject, setSubject] = useState<string>(""); // État pour le sujet
  const [message, setMessage] = useState<string>(""); // État pour le contenu du message

  // Gestion de la soumission du formulaire (vous pouvez remplacer cela par un appel API au backend)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ici, vous pouvez envoyer les données à votre backend (par exemple, via une requête API)
    console.log("Formulaire de contact soumis :", { name, email, subject, message });

    // Réinitialiser le formulaire après la soumission
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    alert("Votre message a été envoyé. Merci de nous avoir contacté !");
  };

  return (
    <div className="flex flex-col items-center px-4 py-6">
      <h2 className="text-2xl font-semibold mb-4">Besoin d'aide ? Contactez-nous</h2>
      <p className="text-center mb-4">
        Si vous avez besoin d'assistance ou souhaitez faire une déclaration, veuillez remplir le formulaire ci-dessous. Nous vous répondrons dans les plus brefs délais.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        {/* Champ Nom */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Votre nom (facultatif)
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
            placeholder="Entrez votre nom"
          />
        </div>

        {/* Champ Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Votre email (facultatif)
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
            placeholder="Entrez votre email (si vous souhaitez une réponse)"
          />
        </div>

        {/* Sélection du Sujet */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
            Sujet
          </label>
          <select
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
          >
            <option value="" disabled>Sélectionnez un sujet</option>
            <option value="Problème de réservation">Problème de réservation</option>
            <option value="Retour sur le tour">Retour sur le tour</option>
            <option value="Problème avec la galerie">Problème avec la galerie</option>
            <option value="Demande générale">Demande générale</option>
            <option value="Autre">Autre</option>
          </select>
        </div>

        {/* Champ Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
            Votre message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
            rows={4}
            placeholder="Veuillez décrire votre problème ou votre demande"
          />
        </div>

        {/* Bouton de soumission */}
        <div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 focus:outline-none"
          >
            Envoyer le message
          </button>
        </div>
      </form>

      <p className="mt-4 text-sm text-gray-500">
        Notre équipe examinera votre message et vous répondra dans les plus brefs délais. Merci de nous avoir contacté !
      </p>
    </div>
  );
};

export default Help;