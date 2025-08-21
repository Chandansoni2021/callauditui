import React from "react";
import LandNavbar from "../LandingPage/LandNavbar";
import LandHero from "../LandingPage/LandHero";
import LandFeatures from "../LandingPage/LandFeatures";
import LandAbout from "../LandingPage/LandAbout";
import LandServices from "../LandingPage/LandServices";
import LandFAQ from "../LandingPage/LandFaq";
import LandFooter from "../LandingPage/LandFooter";

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