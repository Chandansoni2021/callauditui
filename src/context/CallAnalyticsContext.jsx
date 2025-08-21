import { createContext, useContext, useState } from "react";

// Create Context
const CallAnalyticsContext = createContext();

// Provider Component
export const CallAnalyticsProvider = ({ children }) => {
  const [isCallAnalyticsVisible, setIsCallAnalyticsVisible] = useState(false);

  return (
    <CallAnalyticsContext.Provider value={{ isCallAnalyticsVisible, setIsCallAnalyticsVisible }}>
      {children}
    </CallAnalyticsContext.Provider>
  );
};

// Custom Hook to use the context
export const useCallAnalytics = () => useContext(CallAnalyticsContext);
