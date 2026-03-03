import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const Index = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Redirect to landing - this component is a fallback
    if (location.pathname === "/") {
      window.location.href = "/";
    }
  }, [location]);

  return null;
};

export default Index;
