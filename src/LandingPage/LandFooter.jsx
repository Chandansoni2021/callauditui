import React from "react";
import { FaInstagram, FaYoutube, FaLinkedin } from "react-icons/fa";
import sg from "../assets/sg.webp";
import us from "../assets/us.webp";
import uae from "../assets/uae.webp";
import ind from "../assets/ind.webp";

const LandFooter = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center p-0 mt-8 font-geologica rounded-t-2xl overflow-hidden relative w-full">
      {/* Top Section */}
      <div className="flex justify-between items-center p-2.5 mx-auto max-w-7xl w-full">
        <h2 className="text-2xl font-bold text-white">Meridian Solutions</h2>
        <div className="flex gap-6">
          <a
            href="https://www.youtube.com/@onmeridian"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaYoutube className="text-2xl text-white cursor-pointer transition-transform duration-300 hover:scale-125 hover:text-blue-300" />
          </a>
          <a
            href="https://www.instagram.com/onmeridian?igsh=MWw2cjgzZHpobzFuMg=="
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram className="text-2xl text-white cursor-pointer transition-transform duration-300 hover:scale-125 hover:text-blue-300" />
          </a>
          <a
            href="https://www.linkedin.com/company/on-meridian/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaLinkedin className="text-2xl text-white cursor-pointer transition-transform duration-300 hover:scale-125 hover:text-blue-300" />
          </a>
        </div>
      </div>

      {/* Middle Section - Locations */}
      <div className="flex justify-center text-white flex-wrap gap-12 p-5 mx-auto max-w-7xl w-full">
        <div className="text-center max-w-xs">
          <div className="flex flex-row justify-center items-center gap-4">
            <img src={sg} alt="Singapore Flag" className="w-10 h-6 object-cover mb-1.5" />
            <h3 className="text-lg text-white">Singapore</h3>
          </div>
          <p className="text-gray-300">68 Circular Road #02-01 Singapore (049422)</p>
        </div>
        <div className="text-center max-w-xs">
          <div className="flex flex-row justify-center items-center gap-4">
            <img src={us} alt="US Flag" className="w-10 h-6 object-cover mb-1.5" />
            <h3 className="text-lg text-white">US</h3>
          </div>
          <p className="text-gray-300">LLC1207 Delaware Ave #1983 Wilmington, DE 19808</p>
        </div>
        <div className="text-center max-w-xs">
          <div className="flex flex-row justify-center items-center gap-4">
            <img src={ind} alt="India Flag" className="w-10 h-6 object-cover mb-1.5" />
            <h3 className="text-lg text-white">India</h3>
          </div>
          <p className="text-gray-300">
            Tower 8, Office no. 1103 & 1104, 11th Floor, Spaze IT Tech Park, Gurugram, India
          </p>
        </div>
        <div className="text-center max-w-xs">
          <div className="flex flex-row justify-center items-center gap-4">
            <img src={uae} alt="UAE Flag" className="w-10 h-6 object-cover mb-1.5" />
            <h3 className="text-lg text-white">UAE</h3>
          </div>
          <p className="text-gray-300">Unique World Business Centre, Al Karama, Dubai, UAE</p>
        </div>
      </div>

      <div className="border-t border-opacity-20 border-white p-2.5 text-sm mx-auto max-w-7xl w-full">
        <p className="text-gray-400">Meridian Solutions Pvt. Ltd. © 2025. All rights reserved</p>
      </div>
    </footer>
  );
};

export default LandFooter;