import React from "react";
import LandNavbar from "./LandNavbar";
import LandHero from "./LandHero";
import LandFeatures from "./LandFeatures";
import LandAbout from "./LandAbout";
import LandServices from "./LandServices";
import LandFAQ from "./LandFAQ";
import LandFooter from "./LandFooter";

const LandingPage = () => {
  return (
    <div className="bg-white text-black font-sans">
      <LandNavbar />
      <LandHero />
      <LandFeatures />
      <LandAbout />
      <LandServices />
      <LandFAQ />
      <LandFooter />
    </div>
  );
};

export default LandingPage;