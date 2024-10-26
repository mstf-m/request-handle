"use client"

import React, { createContext, useContext } from 'react';
import RequestHandler from '../api/RequestHandler';

const RequestHandlerContext = createContext(RequestHandler);

export const useRequestHandler = () => useContext(RequestHandlerContext);

export const RequestHandlerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RequestHandlerContext.Provider value={RequestHandler}>
    {children}
  </RequestHandlerContext.Provider>
);
