// Country codes with flags, abbreviations and phone formats
export const countryCodes = [
  // Tunisie et pays voisins
  { code: "+216", country: "tn", abbr: "TN", format: "XX XXX XXX", length: 8 }, // Tunisie
  { code: "+213", country: "dz", abbr: "DZ", format: "XXX XX XX XX", length: 9 }, // Algérie
  { code: "+218", country: "ly", abbr: "LY", format: "XX XXX XXXX", length: 9 }, // Libye
  { code: "+20", country: "eg", abbr: "EG", format: "XXX XXX XXXX", length: 10 }, // Égypte
  { code: "+212", country: "ma", abbr: "MA", format: "XX XXX XXXX", length: 9 }, // Maroc

  // Pays européens
  { code: "+33", country: "fr", abbr: "FR", format: "X XX XX XX XX", length: 9 }, // France
  { code: "+39", country: "it", abbr: "IT", format: "XXX XXX XXXX", length: 10 }, // Italie
  { code: "+34", country: "es", abbr: "ES", format: "XXX XXX XXX", length: 9 }, // Espagne
  { code: "+49", country: "de", abbr: "DE", format: "XXX XXXXXXX", length: 10 }, // Allemagne
  { code: "+44", country: "gb", abbr: "GB", format: "XXXX XXXXXX", length: 10 }, // Royaume-Uni
  { code: "+32", country: "be", abbr: "BE", format: "XXX XX XX XX", length: 9 }, // Belgique
  { code: "+41", country: "ch", abbr: "CH", format: "XX XXX XX XX", length: 9 }, // Suisse
  { code: "+351", country: "pt", abbr: "PT", format: "XXX XXX XXX", length: 9 }, // Portugal
  { code: "+31", country: "nl", abbr: "NL", format: "X XX XX XX XX", length: 9 }, // Pays-Bas
  { code: "+30", country: "gr", abbr: "GR", format: "XXX XXX XXXX", length: 10 }, // Grèce
  { code: "+46", country: "se", abbr: "SE", format: "XX XXX XXXX", length: 9 }, // Suède
  { code: "+45", country: "dk", abbr: "DK", format: "XXXX XXXX", length: 8 }, // Danemark
  { code: "+47", country: "no", abbr: "NO", format: "XXX XX XXX", length: 8 }, // Norvège
  { code: "+358", country: "fi", abbr: "FI", format: "XX XXX XXXX", length: 9 }, // Finlande
  { code: "+43", country: "at", abbr: "AT", format: "XXX XXX XXXX", length: 10 }, // Autriche
  { code: "+48", country: "pl", abbr: "PL", format: "XXX XXX XXX", length: 9 }, // Pologne

  // Moyen-Orient
  { code: "+966", country: "sa", abbr: "SA", format: "XX XXX XXXX", length: 9 }, // Arabie Saoudite
  { code: "+971", country: "ae", abbr: "AE", format: "XX XXX XXXX", length: 9 }, // Émirats Arabes Unis
  { code: "+974", country: "qa", abbr: "QA", format: "XXXX XXXX", length: 8 }, // Qatar
  { code: "+973", country: "bh", abbr: "BH", format: "XXXX XXXX", length: 8 }, // Bahreïn
  { code: "+965", country: "kw", abbr: "KW", format: "XXXX XXXX", length: 8 }, // Koweït
  { code: "+961", country: "lb", abbr: "LB", format: "XX XXX XXX", length: 8 }, // Liban
  { code: "+962", country: "jo", abbr: "JO", format: "X XXXX XXXX", length: 9 }, // Jordanie

  // Afrique
  { code: "+221", country: "sn", abbr: "SN", format: "XX XXX XX XX", length: 9 }, // Sénégal
  { code: "+225", country: "ci", abbr: "CI", format: "XX XX XX XX XX", length: 10 }, // Côte d'Ivoire
  { code: "+237", country: "cm", abbr: "CM", format: "XXXX XXXX", length: 8 }, // Cameroun
  { code: "+27", country: "za", abbr: "ZA", format: "XX XXX XXXX", length: 9 }, // Afrique du Sud
  { code: "+254", country: "ke", abbr: "KE", format: "XXX XXX XXX", length: 9 }, // Kenya
  { code: "+234", country: "ng", abbr: "NG", format: "XXX XXX XXXX", length: 10 }, // Nigeria

  // Amériques
  { code: "+1", country: "us", abbr: "US", format: "XXX XXX XXXX", length: 10 }, // États-Unis
  { code: "+1", country: "ca", abbr: "CA", format: "XXX XXX XXXX", length: 10 }, // Canada (même code que US)
  { code: "+52", country: "mx", abbr: "MX", format: "XXX XXX XXXX", length: 10 }, // Mexique
  { code: "+55", country: "br", abbr: "BR", format: "XX XXXX XXXX", length: 10 }, // Brésil
  { code: "+54", country: "ar", abbr: "AR", format: "XX XXXX XXXX", length: 10 }, // Argentine
  { code: "+56", country: "cl", abbr: "CL", format: "X XXXX XXXX", length: 9 }, // Chili
  { code: "+57", country: "co", abbr: "CO", format: "XXX XXX XXXX", length: 10 }, // Colombie
  { code: "+51", country: "pe", abbr: "PE", format: "XXX XXX XXX", length: 9 }, // Pérou

  // Asie
  { code: "+86", country: "cn", abbr: "CN", format: "XXX XXXX XXXX", length: 11 }, // Chine
  { code: "+91", country: "in", abbr: "IN", format: "XXXXX XXXXX", length: 10 }, // Inde
  { code: "+81", country: "jp", abbr: "JP", format: "XX XXXX XXXX", length: 10 }, // Japon
  { code: "+82", country: "kr", abbr: "KR", format: "XX XXXX XXXX", length: 10 }, // Corée du Sud
  { code: "+65", country: "sg", abbr: "SG", format: "XXXX XXXX", length: 8 }, // Singapour
  { code: "+60", country: "my", abbr: "MY", format: "XX XXXX XXXX", length: 10 }, // Malaisie
  { code: "+66", country: "th", abbr: "TH", format: "X XXXX XXXX", length: 9 }, // Thaïlande
  { code: "+84", country: "vn", abbr: "VN", format: "XX XXX XX XX", length: 9 }, // Vietnam
  { code: "+62", country: "id", abbr: "ID", format: "XXX XXX XXXX", length: 10 }, // Indonésie
  { code: "+63", country: "ph", abbr: "PH", format: "XXX XXX XXXX", length: 10 }, // Philippines
  { code: "+92", country: "pk", abbr: "PK", format: "XXX XXX XXXX", length: 10 }, // Pakistan

  // Océanie
  { code: "+61", country: "au", abbr: "AU", format: "XXX XXX XXX", length: 9 }, // Australie
  { code: "+64", country: "nz", abbr: "NZ", format: "XX XXX XXXX", length: 9 }, // Nouvelle-Zélande
]

// Define the type for a country code entry
export type CountryCode = {
  code: string
  country: string
  abbr: string
  format: string
  length: number
}
