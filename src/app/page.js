"use client";


import TokenVerifier from "./auth/TokenVerifier";
import Data from "./components/Data";

export default function HomePage() {

  return (
    <main >
      <TokenVerifier/>
      <Data/>
    </main>
  );
}
