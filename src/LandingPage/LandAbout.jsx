import React, { useEffect, useRef } from "react";
import landaboutpic from "../assets/landaboutpic.jpg";

const LandAbout = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target); // Stop observing once triggered
        }
      },
      { threshold: 0.2 } // Trigger when 20% of the section is visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative py-20 px-4 overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Image with decorative border */}
          <div className="relative lg:w-1/2">
            <div className="relative z-10 w-full h-full max-w-lg mx-auto">
              <img
                src={landaboutpic}
                alt="Our Team"
                className={`rounded-2xl shadow-2xl w-full h-auto object-cover transition-transform duration-1000 ${
                  isVisible ? "translate-x-0" : "-translate-x-full"
                }`}
              />
              <div className="absolute -inset-4 border-2 border-blue-300 rounded-2xl opacity-20"></div>
              <div className="absolute -inset-8 border-2 border-indigo-200 rounded-2xl opacity-20"></div>
            </div>
            <div className="hidden lg:block absolute -bottom-8 -right-8 w-32 h-32 bg-blue-500 rounded-lg z-0"></div>
          </div>

          {/* Content */}
          <div className="lg:w-1/2">
            <span className="inline-block px-4 py-1 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full mb-4">
              Our Story
            </span>
            <h2 className={`text-4xl md:text-5xl font-bold text-gray-900 mb-6 transition-transform duration-1000 ${
              isVisible ? "translate-x-0" : "translate-x-full"
            }`}>
             Redefining <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Call Quality</span> and Compliance
            </h2>
            <p className={`text-lg text-gray-600 mb-8 leading-relaxed transition-transform duration-1000 ${
              isVisible ? "translate-x-0" : "translate-x-full"
            }`}>
             We’re a driven team committed to transforming how organizations monitor and improve customer interactions. Our goal is to empower businesses with intelligent tools that make every call an opportunity for growth, compliance, and excellence.
            </p>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 transition-transform duration-1000 ${
              isVisible ? "translate-x-0" : "translate-x-full"
            }`}>
              {[
                { 
                  title: "Our Mission", 
                  content: "To elevate call auditing through AI-driven insights and seamless collaboration, ensuring every conversation meets the highest standards." 
                },
                { 
                  title: "Our Vision", 
                  content: "A future where every call reflects quality, compliance, and meaningful engagement between businesses and their customers." 
                }
              ].map((item, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.content}</p>
                </div>
              ))}
            </div>

            <div className={`flex flex-wrap gap-4 transition-transform duration-1000 ${
              isVisible ? "translate-x-0" : "translate-x-full"
            }`}>
              <a
                href="/login"
                className="hidden md:inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:text-white transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                Get Started
                <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Stats section */}
        {/* <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { number: "50+", label: "Team Members" },
            { number: "2015", label: "Founded In" },
            { number: "500+", label: "Happy Clients" },
            { number: "24/7", label: "Global Support" }
          ].map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow">
              <p className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</p>
              <p className="text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div> */}
      </div>
    </section>
  );
};

export default LandAbout;