import React, { useEffect, useRef } from 'react';

const LandServices = () => {
  const services = [
    {
      title: "AI-Powered Transcription",
      description: "Automatically convert calls into accurate, structured transcripts for faster review and analysis.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Smart Call Scoring",
      description: "Evaluate and rank calls based on customizable criteria using intelligent AI algorithms.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Bulk Call Analysis",
      description: "Audit large volumes of calls effortlessly with automated parsing, scoring, and detailed compliance reports.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: "from-green-500 to-green-600"
    },
    {
      title: "Insight-Driven Prioritization",
      description: "Quickly identify calls that need attention with AI-based performance scoring and flagging.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: "from-orange-500 to-orange-600"
    },
    {
      title: "Advanced Audit Analytics",
      description: "Access real-time dashboards with actionable insights into team performance, call quality, and compliance metrics.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: "from-red-500 to-red-600"
    },
    {
      title: "Intelligent Feedback Engine",
      description: "Deliver personalized coaching and quality feedback powered by AI-driven call insights.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  const sectionRef = useRef(null);
  const serviceRefs = useRef([]);
  const headingRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fadeInUp');
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all service cards
    serviceRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    // Observe heading section
    if (headingRef.current) observer.observe(headingRef.current);

    // Observe button
    if (buttonRef.current) observer.observe(buttonRef.current);

    return () => {
      serviceRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
      if (headingRef.current) observer.unobserve(headingRef.current);
      if (buttonRef.current) observer.unobserve(buttonRef.current);
    };
  }, []);

  return (
    <section id="services" className="relative py-20 px-4 bg-gradient-to-b from-gray-50 to-white overflow-hidden" ref={sectionRef}>
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent z-10"></div>
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent z-10"></div>

      <div className="max-w-7xl mx-auto relative z-20">
        <div className="text-center mb-16" ref={headingRef}>
          <span className="inline-block px-4 py-1 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full mb-4">
            What We Offer
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Comprehensive <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Call Audit Solutions</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            End-to-end tools designed to streamline call monitoring, evaluation, and reporting.
          </p>
        </div>

        {/* First row of services */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {services.slice(0, 3).map((service, index) => (
            <div
              key={index}
              ref={el => serviceRefs.current[index] = el}
              className="group relative bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-transparent"
            >
              <div className={`bg-gradient-to-r ${service.color} w-14 h-14 rounded-lg flex items-center justify-center mb-6 text-white`}>
                {service.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h3>
              <p className="text-gray-600 mb-6">{service.description}</p>
              <div className="absolute top-0 left-0 w-full h-full border-2 border-transparent group-hover:border-blue-200 rounded-xl pointer-events-none transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
            </div>
          ))}
        </div>

        {/* Second row of services */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.slice(3, 6).map((service, index) => (
            <div
              key={index + 3}
              ref={el => serviceRefs.current[index + 3] = el}
              className="group relative bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-transparent"
            >
              <div className={`bg-gradient-to-r ${service.color} w-14 h-14 rounded-lg flex items-center justify-center mb-6 text-white`}>
                {service.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h3>
              <p className="text-gray-600 mb-6">{service.description}</p>
              <div className="absolute top-0 left-0 w-full h-full border-2 border-transparent group-hover:border-blue-200 rounded-xl pointer-events-none transition-all duration-300 group-hover:opacity-100"></div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <a
            href="/admin"
            ref={buttonRef}
            className="hidden md:inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:text-white transition-all hover:shadow-lg hover:-translate-y-0.5 opacity-0"
          >
            Get Started
            <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default LandServices;