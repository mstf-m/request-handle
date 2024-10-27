"use client";

import React, { useEffect, useState } from "react";
import { useRequestHandler } from "../context/RequestHandlerContext";
import { LoginRequest } from "../api/LoginRequest";

export const LoginComponent: React.FC = () => {
  const requestHandler = useRequestHandler();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Ensures client-only rendering logic
  }, []);

  const handleLogin = () => {
    if (isClient) {
      LoginRequest.send("989120515679", (response) => {
        console.log("Login response:", response);
      });
    }
  };

  return <button onClick={handleLogin}>Login</button>;
};
