import React from "react";

type AuthenticatedProps = {
      children: React.ReactNode;
      fallback: React.ReactNode;
};

const Authenticated = ({ children, fallback }: AuthenticatedProps) => {
      // Kiểm tra token trong localStorage
      const token = localStorage.getItem('token');
      const isAuthenticated = !!token;
      
      return <>{isAuthenticated ? children : fallback}</>;
};

export default Authenticated;
