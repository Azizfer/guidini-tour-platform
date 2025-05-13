import TunisiaInteractiveMapV4 from "./Interactive-map"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { MapPin, Info } from "lucide-react"

export default function CarteInteractivePage() {
  return (
    <main className="min-h-screen bg-[#f8f7f4]">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Carte Interactive de la Tunisie</h1>
          <p className="text-lg max-w-2xl mx-auto text-gray-700 mb-6">
            Explorez les différentes régions et découvrez les merveilles touristiques de chaque destination
          </p>

          <div className="flex justify-center gap-8 mb-8">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-teal-500 mr-2"></div>
              <span className="text-sm text-gray-600">Destinations populaires</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm text-gray-600">Points d'intérêt</span>
            </div>
          </div>
        </div>

        <TunisiaInteractiveMapV4 />

        <div className="mt-8 text-center max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Info className="h-4 w-4 text-teal-500" />
            <p className="text-sm font-medium text-gray-700">Comment utiliser la carte</p>
          </div>
          <p className="text-gray-600 text-sm">
            Survolez les points colorés pour voir le nom de la région, puis cliquez pour découvrir les attractions et
            activités disponibles. Le panneau latéral vous donnera plus d'informations et vous permettra d'explorer en
            détail chaque destination.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  )
}
