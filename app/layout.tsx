import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Agrónomo - IA Agrícola Guinea Ecuatorial',
  description: 'Diagnóstico inteligente de cultivos, plagas y enfermedades botánicas para Guinea Ecuatorial con IA Vision y almacenamiento Turso Cloud.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Agrónomo GE'
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png'
  }
};

export const viewport: Viewport = {
  themeColor: '#00732F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      'name': 'Agrónomo GE',
      'operatingSystem': 'Android, Web, PWA',
      'applicationCategory': 'BusinessApplication',
      'offers': {
        '@type': 'Offer',
        'price': '2000',
        'priceCurrency': 'XAF'
      },
      'description': 'Sistema de diagnóstico fitosanitario con Inteligencia Artificial para agricultores y cooperativas de Guinea Ecuatorial.'
    },
    {
      '@type': 'LocalBusiness',
      'name': 'Agrónomo Guinea Ecuatorial',
      'areaServed': {
        '@type': 'Country',
        'name': 'Equatorial Guinea'
      },
      'currenciesAccepted': 'XAF',
      'paymentAccepted': 'Tarjetas Prepago Rasca, Efectivo en Cooperativas',
      'url': 'https://agronomo-ge.vercel.app'
    },
    {
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': '¿Cómo diagnosticar enfermedades de plantas en Guinea Ecuatorial?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Con la aplicación Agrónomo GE, solo enfocas la cámara en la hoja o fruto del cultivo (cacao, yuca, plátano, café, palma) y la inteligencia artificial identifica la patología y prescribe tratamientos ecológicos y químicos accesibles en Guinea Ecuatorial.'
          }
        },
        {
          '@type': 'Question',
          'name': '¿Cómo comprar tarjetas prepago de Agrónomo en FCFA?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Las tarjetas rasca prepago de Agrónomo GE están disponibles en Francos CFA desde 2.000 FCFA por mes en cooperativas agrícolas y puntos autorizados en Malabo y Bata.'
          }
        }
      ]
    }
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-[#0D1A12] antialiased">
        {children}
      </body>
    </html>
  );
}
