
"use client"

import { RequestHandlerProvider } from "./context/RequestHandlerContext";
import { LoginComponent } from "./components/exampleComponent";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => console.log('Service Worker registered:', registration))
        .catch((error) => console.error('Service Worker registration failed:', error));
    }
  }, []);
  return (
    <RequestHandlerProvider>
    <LoginComponent />
  </RequestHandlerProvider>
  )
}
