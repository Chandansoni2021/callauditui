import React, { useState, useEffect } from 'react';
import ContactPopup from './ContactPopup';
import { useNavigate } from 'react-router-dom';

const LandHero = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [startHeroAnimation, setStartHeroAnimation] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setStartHeroAnimation(true);
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section id='home' className="relative min-h-screen w-full overflow-hidden">
      {/* Video Background with overlay */}
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="w-full h-full object-cover"
        >
          <source src="https://knowledgeminner.blob.core.windows.net/miscdata/herov-Dviv3bFu.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-purple-900/60 to-slate-900/80"></div>
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0 z-0 opacity-30">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center items-center text-center min-h-screen px-4">
        <div className="max-w-6xl mx-auto">
          {/* Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8 transform transition-all duration-700 ${startHeroAnimation ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-200 font-medium">AI-Powered Call Analytics Platform</span>
          </div>

          {/* Main heading */}
          <h1 className={`text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight transform transition-all duration-700 ease-out ${startHeroAnimation ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Revolutionize
            </span>
            <br />
            <span className={`inline-block bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent transition-all duration-700 delay-200 ${startHeroAnimation ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              Call Monitoring
            </span>
          </h1>

          {/* Subheading */}
          <p className={`text-xl md:text-2xl lg:text-3xl text-gray-200 mb-12 max-w-4xl mx-auto leading-relaxed transform transition-all duration-700 delay-300 ${startHeroAnimation ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            AI-powered auditing that helps you <span className="text-cyan-300 font-semibold">evaluate conversations</span>, ensure compliance, and boost performance
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row justify-center items-center gap-6 transform transition-all duration-700 delay-500 ${startHeroAnimation ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <button
              onClick={() => navigate('/LoginPage')}
              className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center gap-2">
                Get Started
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 transition-all duration-700 delay-700 ${startHeroAnimation ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2"></div>
          </div>
        </div>
      </div>

      <ContactPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default LandHero;