import TokenVerifier from "app/auth/TokenVerifier";
import Navbar from "app/components/Navbar";
import About from "./About";
import AboutHeroSec from "./AboutHeroSec";
import OurMission from "./OurMission";


export default function AboutUs() {
  return (
    <div >
      <Navbar/>
      <TokenVerifier/>
      <About/>
      
    
    </div>
  );
}
