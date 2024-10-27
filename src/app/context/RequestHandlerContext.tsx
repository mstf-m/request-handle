"use client";

import React, { createContext, useContext } from 'react';
import { RequestHandler } from '../api/RequestHandler';

const requestHandlerInstance = RequestHandler.getInstance(); // Ensure only one instance

const RequestHandlerContext = createContext<RequestHandler | null>(null);

export const useRequestHandler = () => {
  const context = useContext(RequestHandlerContext);
  if (!context) {
    throw new Error("useRequestHandler must be used within a RequestHandlerProvider");
  }
  return context;
};

export const RequestHandlerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RequestHandlerContext.Provider value={requestHandlerInstance}>
    {children}
  </RequestHandlerContext.Provider>
);
