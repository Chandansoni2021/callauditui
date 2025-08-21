import React, { useState, useEffect } from 'react';
import ContactPopup from './ContactPopup'; // Adjust path based on your folder structure

const LandHero = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [startHeroAnimation, setStartHeroAnimation] = useState(false);

  useEffect(() => {
    // Wait for navbar animation to complete (0.5s animation + 0.4s for last item delay)
    const timer = setTimeout(() => {
      setStartHeroAnimation(true);
    }, 900); // 500ms animation + 400ms for last item delay

    return () => clearTimeout(timer);
  }, []);

  return (
    <section id='home' className="relative h-screen w-full overflow-hidden">
      {/* Video Background with fade-in animation */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${startHeroAnimation ? 'opacity-100' : 'opacity-0'}`}>
        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
          <source src="https://knowledgeminner.blob.core.windows.net/miscdata/herov-Dviv3bFu.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Content with staggered animations */}
      <div className="relative z-10 flex flex-col justify-center items-center text-center h-full px-4">
        <div className="mx-auto">
          {/* Main heading with animation */}
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-[3.5rem] transform transition-all duration-700 ease-out ${startHeroAnimation ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Revolutionize Your Call Monitoring
            </span>
            <br />
            <span className={`inline-block transition-all duration-700 delay-100 ${startHeroAnimation ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              with Smart Call Audits
            </span>
          </h1>
          {/* Paragraph with animation */}
          <p className={`text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto transform transition-all duration-700 delay-200 ${startHeroAnimation ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            AI-powered auditing that helps you evaluate conversations, ensure compliance, and boost performance—faster than ever before.
          </p>

          {/* Button with animation */}
          <div className={`flex flex-col sm:flex-row justify-center gap-4 rounded-full transform transition-all duration-700 delay-300 ${startHeroAnimation ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <button
              onClick={() => setIsPopupOpen(true)}
              className="relative px-8 rounded-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold overflow-hidden group"
            >
              <span className="relative z-10">Contact us</span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
            </button>
          </div>
        </div>
      </div>

      {/* Contact Popup */}
      <ContactPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
    </section>
  );
};

export default LandHero;