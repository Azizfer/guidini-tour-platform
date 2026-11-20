require('dotenv').config();
const mongoose = require('mongoose');
const Destination = require('./models/Destination');

// Default destinations to insert if collection is empty
const defaultDestinations = [
  {
    name: 'Sidi Bou Said',
    subtitle: 'Village bleu et blanc',
    image: 'https://res.cloudinary.com/pfe-project/image/upload/v1749659450/Sidi-bou_amgvws.jpg',
    description: 'Village bleu et blanc perché sur une falaise avec vue sur la Méditerranée.',
    longDescription: 'Explorez les ruelles pavées, les portes bleues iconiques et profitez des vues panoramiques.',
    location: 'Tunis',
    bestTime: 'Avril à Octobre',
    category: 'Patrimoine',
  },
  {
    name: 'Sahara Tunisien',
    subtitle: 'Désert majestueux',
    image: 'https://res.cloudinary.com/pfe-project/image/upload/v1749659397/Sahara_xdg26n.jpg',
    description: 'Découvrez les dunes dorées et l\'immensité du désert tunisien.',
    longDescription: 'Vivez une expérience unique en 4x4 ou à dos de chameau, admirez les couchers de soleil.',
    location: 'Sud de la Tunisie',
    bestTime: 'Octobre à Avril',
    category: 'Nature',
  },
  {
    name: 'Carthage',
    subtitle: 'Site archéologique',
    image: 'https://res.cloudinary.com/pfe-project/image/upload/v1749659445/Carthage_x63apv.jpg',
    description: 'Plongez dans l\'histoire de la cité punique puis romaine.',
    longDescription: 'Visitez les thermes d\'Antonin, l\'amphithéâtre et les villas romaines bien préservées.',
    location: 'Tunis',
    bestTime: 'Mars à Juin, Septembre à Novembre',
    category: 'Histoire',
  },
  {
    name: 'Djerba',
    subtitle: 'Île paradisiaque',
    image: 'https://res.cloudinary.com/pfe-project/image/upload/v1749659441/Djerba_kd2ybq.jpg',
    description: 'Île aux plages de sable fin et au charme authentique.',
    longDescription: 'Découvrez Houmt Souk, ses marchés colorés et les villages berbères traditionnels.',
    location: 'Sud-Est de la Tunisie',
    bestTime: 'Mai à Octobre',
    category: 'Plages',
  },
  {
    name: 'Kairouan',
    subtitle: 'Ville sainte',
    image: 'https://res.cloudinary.com/pfe-project/image/upload/v1749659401/Kairouan_hiopfo.jpg',
    description: 'Quatrième ville sainte de l\'Islam, patrimoine culturel mondial.',
    longDescription: 'Visitez la Grande Mosquée Okba, les bassins des Aghlabides et les souks traditionnels.',
    location: 'Centre de la Tunisie',
    bestTime: 'Mars à Mai, Septembre à Novembre',
    category: 'Spirituel',
  },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/Guidini');

    const count = await Destination.countDocuments();
    if (count === 0) {
      await Destination.insertMany(defaultDestinations);
      console.log('✅ Destinations seeded');
    } else {
      console.log('ℹ️ Destinations collection already populated');
    }
  } catch (err) {
    console.error('Error seeding destinations:', err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
})();
