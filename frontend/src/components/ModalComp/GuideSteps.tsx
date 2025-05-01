import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { User, Mail, Lock, Camera, AlertCircle, MapPin, FileText, X, Upload, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Interfaces pour les props
interface GuideBasicInfoProps {
  name: string;
  setName: (value: string) => void;
  profilePhoto: File | null;
  setProfilePhoto: React.Dispatch<React.SetStateAction<File | null>>;
  profilePhotoPreview: string | null;
  setProfilePhotoPreview: React.Dispatch<React.SetStateAction<string | null>>;
  prevStep: () => void;
  nextStep: () => void;
}

interface GuidePersonalInfoProps {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  languages: string[];
  setLanguages: React.Dispatch<React.SetStateAction<string[]>>;
  idCard: File | null;
  setIdCard: React.Dispatch<React.SetStateAction<File | null>>;
  certificate: File | null;
  setCertificate: React.Dispatch<React.SetStateAction<File | null>>;
  prevStep: () => void;
  nextStep: () => void;
}

interface GuideExpertiseProps {
  documents: File[];
  setDocuments: React.Dispatch<React.SetStateAction<File[]>>;
  prevStep: () => void;
  nextStep: () => void;
}

// Composant pour les informations de base du guide (nom et photo)
export const GuideBasicInfo = ({
  name,
  setName,
  profilePhoto,
  setProfilePhoto,
  profilePhotoPreview,
  setProfilePhotoPreview,
  prevStep,
  nextStep,
}: GuideBasicInfoProps) => {
  
  // Gestion de l'upload d'image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePhoto(file);
      
      // Créer un aperçu de l'image
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Validation avant de passer à l'étape suivante
  const handleNextStep = () => {
    if (!name) {
      alert("Veuillez saisir votre nom");
      return;
    }
    nextStep();
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-center">Bienvenue chez Guidini</h2>
      <p className="text-center text-sm text-gray-500">
        Commençons par quelques informations de base
      </p>
      
      <div className="space-y-4">
        <div className="flex flex-col items-center mb-4">
          <div 
            className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-colors mb-2"
            onClick={() => document.getElementById('profile-image-guide')?.click()}
          >
            {profilePhotoPreview ? (
              <img src={profilePhotoPreview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <Camera className="h-8 w-8 text-gray-400" />
            )}
            <input
              id="profile-image-guide"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
          <span className="text-xs text-gray-500">Photo de profil (optionnel)</span>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">
            <span>Nom complet</span>
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Votre nom complet"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
      </div>
      
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={prevStep}>
          Retour
        </Button>
        <Button onClick={handleNextStep}>
          Continuer
        </Button>
      </div>
    </div>
  );
};

// Composant pour les informations personnelles du guide
export const GuidePersonalInfo = ({
  email,
  setEmail,
  password,
  setPassword,
  languages,
  setLanguages,
  idCard,
  setIdCard,
  certificate,
  setCertificate,
  prevStep,
  nextStep,
}: GuidePersonalInfoProps) => {
  const [passwordError, setPasswordError] = useState("");
  const [passwordHasMinLength, setPasswordHasMinLength] = useState(false);
  const [passwordHasUppercase, setPasswordHasUppercase] = useState(false);
  const [passwordHasLowercase, setPasswordHasLowercase] = useState(false);
  
  // Validation du mot de passe
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordHasMinLength(value.length >= 8);
    setPasswordHasUppercase(/[A-Z]/.test(value));
    setPasswordHasLowercase(/[a-z]/.test(value));
  };
  
  // Gestion de l'upload de la carte d'identité
  const handleIdCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIdCard(file);
    }
  };
  
  // Gestion de l'upload de la certification professionnelle
  const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCertificate(file);
    }
  };
  
  // Validation avant de passer à l'étape suivante
  const handleNextStep = () => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      alert("Veuillez saisir une adresse email valide");
      return;
    }
    if (!password || !passwordHasMinLength || !passwordHasUppercase || !passwordHasLowercase) {
      alert("Veuillez saisir un mot de passe valide");
      return;
    }
    if (languages.length === 0) {
      alert("Veuillez sélectionner au moins une langue");
      return;
    }
    if (!idCard) {
      alert("Veuillez télécharger votre carte d'identité");
      return;
    }
    if (!certificate) {
      alert("Veuillez télécharger votre certification professionnelle");
      return;
    }
    nextStep();
  };
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-center">Profil de Guide</h2>
      <p className="text-center text-sm text-gray-500">
        Créez votre profil professionnel
      </p>
      
      <div className="space-y-4">
        
        <div className="space-y-2">
          <Label htmlFor="email">Email professionnel</Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="pl-10"
              required
            />
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <div className="relative">
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                handlePasswordChange(e.target.value);
              }}
              placeholder="••••••••"
              className={cn("pl-10", passwordError && "border-red-500")}
              required
            />
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          {passwordError && (
            <div className="flex items-center text-red-500 text-xs mt-1">
              <AlertCircle className="h-3 w-3 mr-1" />
              {passwordError}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Le mot de passe doit contenir au moins 8 caractères, une majuscule et une minuscule.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="idCard">
            <span>Carte d'identité / Passeport</span>
          </Label>
          <Input
            id="idCard"
            type="file"
            accept="image/*,.pdf"
            onChange={handleIdCardChange}
            className="cursor-pointer"
            required
          />
          {idCard && (
            <div className="text-sm text-green-600 dark:text-green-400">
              Fichier sélectionné: {idCard.name}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="professionalCertificate">
            <span>Certification professionnelle</span>
          </Label>
          <Input
            id="professionalCertificate"
            type="file"
            accept="image/*,.pdf"
            onChange={handleCertificateChange}
            className="cursor-pointer"
            required
          />
          {certificate && (
            <div className="text-sm text-green-600 dark:text-green-400">
              Fichier sélectionné: {certificate.name}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Langues parlées
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {["Français", "Anglais", "Espagnol", "Arabe", "Italien", "Allemand", "Portugais", "Russe"].map((lang) => (
              <div 
                key={lang}
                className="flex items-center space-x-2"
              >
                <Checkbox 
                  id={`lang-${lang}`} 
                  checked={languages.includes(lang)}
                  onCheckedChange={() => {
                    setLanguages((prev: string[]) => 
                      prev.includes(lang) 
                        ? prev.filter((l: string) => l !== lang) 
                        : [...prev, lang]
                    );
                  }}
                />
                <label 
                  htmlFor={`lang-${lang}`}
                  className="text-sm font-medium cursor-pointer"
                >
                  {lang}
                </label>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Vous pouvez sélectionner plusieurs langues
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Sélectionnez toutes les langues que vous parlez couramment
          </p>
        </div>
      </div>
      
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={prevStep}>
          Retour
        </Button>
        <Button onClick={handleNextStep}>
          Continuer
        </Button>
      </div>
    </div>
  );
};

// Composant pour les documents d'expertise du guide
export const GuideExpertise = ({
  documents,
  setDocuments,
  prevStep,
  nextStep,
}: GuideExpertiseProps) => {
  const [specialties, setSpecialties] = useState<string[]>([]);
  
  // Validation avant de passer à l'étape suivante
  const handleNextStep = () => {
    if (documents.length === 0) {
      alert("Veuillez télécharger au moins un document d'expertise");
      return;
    }
    if (specialties.length === 0) {
      alert("Veuillez sélectionner au moins une spécialité");
      return;
    }
    nextStep();
  };
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-center">Expertise et Documents</h2>
      <p className="text-center text-sm text-gray-500">
        Précisez vos spécialités et téléchargez vos documents d'expertise
      </p>
      
      <div className="space-y-4 mb-6">
        <Label className="font-medium">Vos spécialités</Label>
        <div className="grid grid-cols-2 gap-3">
          {[
            "Histoire et Patrimoine", 
            "Nature et Randonnée", 
            "Gastronomie", 
            "Culture locale", 
            "Architecture", 
            "Art et Musées", 
            "Vie nocturne", 
            "Shopping"            
          ].map((specialty) => (
            <div 
              key={specialty}
              className="flex items-center space-x-2"
            >
              <Checkbox 
                id={`specialty-${specialty}`} 
                checked={specialties.includes(specialty)}
                onCheckedChange={() => {
                  setSpecialties((prev: string[]) => 
                    prev.includes(specialty) 
                      ? prev.filter((s: string) => s !== specialty) 
                      : [...prev, specialty]
                  );
                }}
              />
              <label 
                htmlFor={`specialty-${specialty}`}
                className="text-sm font-medium cursor-pointer"
              >
                {specialty}
              </label>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Vous pouvez sélectionner plusieurs spécialités
        </p>
      </div>
      
      <div 
        className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800/50"
        onClick={() => document.getElementById("file-upload")?.click()}
      >
        <input
          id="file-upload"
          type="file"
          multiple
          onChange={(e) => e.target.files && setDocuments(Array.from(e.target.files) as File[])}
          className="hidden"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        />
        
        <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-sm font-medium">
          Cliquez ou glissez-déposez vos documents ici
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Formats acceptés: PDF, DOC, DOCX, JPG, JPEG, PNG
        </p>
      </div>
      
      {documents.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Documents téléchargés ({documents.length})</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {documents.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm truncate max-w-[200px]">{doc.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDocuments((prev: File[]) => prev.filter((_, i) => i !== index));
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={prevStep}>
          Retour
        </Button>
        <Button 
          onClick={handleNextStep}
          disabled={documents.length === 0}
        >
          Continuer
        </Button>
      </div>
    </div>
  );
};
