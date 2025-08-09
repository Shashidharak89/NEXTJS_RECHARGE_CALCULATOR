"use client";


import TokenVerifier from "./auth/TokenVerifier";
import Data from "./components/Data";
import RechargeList from "./components/RechargeList";

export default function HomePage() {

  return (
    <main >
      <TokenVerifier/>
      <Data/>
      <RechargeList/>
    </main>
  );
}
