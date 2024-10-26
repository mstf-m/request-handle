"use client"

import React from "react";
import { useRequestHandler } from "../context/RequestHandlerContext";
import LoginRequest from "../api/LoginRequest";

export const LoginComponent: React.FC = () => {
  const requestHandler = useRequestHandler();

  const handleLogin = () => {
    LoginRequest.send("989120515679", (response) => {
      console.log("Login response:", response);
    });
  };

  return <button onClick={handleLogin}>Login</button>;
};
