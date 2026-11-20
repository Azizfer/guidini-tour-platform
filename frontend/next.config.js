/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure on-demand entries
  onDemandEntries: {
    // Number of pages that should be kept simultaneously without being disposed
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept in memory
    pagesBufferLength: 2,
  },
  images: {
    domains: ['flagcdn.com', 'localhost', 'ferf1mheo22r9ira.public.blob.vercel-storage.com', 'hebbkx1anhila5yf.public.blob.vercel-storage.com', 'res.cloudinary.com'], 
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ferf1mheo22r9ira.public.blob.vercel-storage.com',
        pathname: '/**',
      },
    ],
  },
  // Enable SVG support
  webpack(config) {
    // Add SVG support
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });
    
    return config;
  },
};

module.exports = nextConfig;
