import TunisiaInteractiveMap from "./Interactive-map"
import Header from "@/components/Header"
import Footer from "@/components/footer"
import { MapPin, Compass } from "lucide-react"

export default function CarteInteractivePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      <div className="container mx-auto px-4 py-16">
        {/* En-tête de la page */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md mb-6">
            <Compass className="h-5 w-5 text-blue-500" />
            <span className="text-blue-600 font-semibold text-sm">Exploration Interactive</span>
          </div>

          <h1 className="text-4xl font-bold mb-6 text-gray-900 leading-tight">
            Découvrez la
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Tunisie</span>
          </h1>

          <p className="text-lg max-w-3xl mx-auto text-gray-600 mb-8 leading-relaxed">
            Explorez les trésors cachés de chaque région tunisienne grâce à notre carte interactive. Cliquez sur les
            destinations pour découvrir leurs attractions uniques et planifier votre voyage.
          </p>

          {/* Carte interactive */}
        </div>

        <TunisiaInteractiveMap />

        {/* Section d'aide */}
        <div className="mt-16 bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <MapPin className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Comment utiliser la carte</h3>
            <p className="text-gray-600">Suivez ces étapes simples pour explorer la Tunisie</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-xl bg-blue-50">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                1
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Explorez la carte</h4>
              <p className="text-gray-600 text-sm">
                Naviguez sur la carte et observez les points colorés représentant chaque région
              </p>
            </div>

            <div className="text-center p-4 rounded-xl bg-indigo-50">
              <div className="w-12 h-12 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                2
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Cliquez pour découvrir</h4>
              <p className="text-gray-600 text-sm">
                Cliquez sur une région pour ouvrir le panneau détaillé avec toutes les informations
              </p>
            </div>

            <div className="text-center p-4 rounded-xl bg-purple-50">
              <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                3
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">
                Accédez aux activités dans la destination qui vous souhaitez
              </h4>
              <p className="text-gray-600 text-sm"></p>
            </div>

            <div className="text-center p-4 rounded-xl bg-green-50">
              <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                4
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Réservez</h4>
              <p className="text-gray-600 text-sm">Réservez vos tours avec les guides qui vous conviennent</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
