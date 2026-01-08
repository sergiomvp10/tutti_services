import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingBag, LogIn, Users, Phone } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [config, setConfig] = useState({
    mainMessage: 'Los productos más frescos y al mejor precio de Cartagena',
    subtitle: 'Distribuidora de Frutas y Verduras para mayoristas',
    whatsappLink: 'https://wa.link/ykjebj'
  });

  useEffect(() => {
    const saved = localStorage.getItem('landingConfig');
    if (saved) {
      setConfig(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1920&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-4 sm:p-6">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <img src="/tutti_logo.png" alt="Tutti Services" className="h-16 sm:h-20 md:h-24 object-contain" />
            </div>
            <button 
              className="inline-flex items-center px-4 py-2 border-2 border-white text-white rounded-md hover:bg-white hover:text-green-700 transition-colors font-medium"
              onClick={() => navigate('/login')}
            >
              <LogIn className="w-5 h-5 mr-2" />
              Ingresar
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-4xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              {config.mainMessage}
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 mb-12">
              {config.subtitle}
            </p>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <Button 
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white py-6 text-lg flex flex-col items-center gap-2 h-auto"
                onClick={() => navigate('/catalog')}
              >
                <ShoppingBag className="w-8 h-8" />
                <span>Catálogo</span>
              </Button>
              
              <Button 
                size="lg"
                className="bg-white hover:bg-gray-100 text-green-700 py-6 text-lg flex flex-col items-center gap-2 h-auto"
                onClick={() => navigate('/login')}
              >
                <LogIn className="w-8 h-8" />
                <span>Iniciar Sesión</span>
              </Button>
              
              <button 
                className="border-2 border-white text-white hover:bg-white hover:text-green-700 py-6 text-lg flex flex-col items-center gap-2 h-auto rounded-md transition-colors font-medium"
                onClick={() => window.open(config.whatsappLink, '_blank')}
              >
                <Users className="w-8 h-8" />
                <span>Trabaja con Nosotros</span>
              </button>
              
              <button 
                className="border-2 border-white text-white hover:bg-white hover:text-green-700 py-6 text-lg flex flex-col items-center gap-2 h-auto rounded-md transition-colors font-medium"
                onClick={() => window.open(config.whatsappLink, '_blank')}
              >
                <Phone className="w-8 h-8" />
                <span>Contáctanos</span>
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-4 sm:p-6 text-center text-white/70">
          <p>&copy; 2026 Tutti Services - Cartagena, Colombia</p>
        </footer>
      </div>

      {/* WhatsApp Button */}
      <a
        href={config.whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-xl transition-all hover:scale-110"
        title="Contactar por WhatsApp"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-8 h-8"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  );
};
