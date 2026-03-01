"use client";

import { Suspense } from "react";
import TokenVerifier from "./auth/TokenVerifier";
import Data from "./components/Data";

export default function HomePage() {
  return (
    <main>
      <Suspense fallback={<div style={{padding:20}}>Loading...</div>}>
        <TokenVerifier />
        <Data />
      </Suspense>
    </main>
  );
}
