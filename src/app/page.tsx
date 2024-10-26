import Image from "next/image";
import { RequestHandlerProvider } from "./context/RequestHandlerContext";
import { LoginComponent } from "./components/exampleComponent";

export default function Home() {
  return (
    <RequestHandlerProvider>
    <LoginComponent />
  </RequestHandlerProvider>
  )
}
