import { Button } from "./ui/Button";
import { ArrowRight } from "lucide-react";
import heroVisual from "@/assets/hero-visual.jpg";

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center pt-20 pb-12 px-6">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-block">
              <span className="text-accent text-sm font-semibold tracking-wide uppercase">
                Next-Generation Medical AI
              </span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Precision Diagnostics
              <br />
              <span className="text-gradient">Powered by AI</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
              Transform medical imaging with AI-driven diagnostics that detect conditions 
              earlier and more accurately. FDA-cleared and HIPAA-compliant.
            </p>
            

          </div>

          {/* Right Column - Visual */}
          <div className="relative animate-fade-in">
            <div className="relative rounded-2xl overflow-hidden shadow-clinical">
              <img
                src={heroVisual}
                alt="Medical AI Visualization"
                className="w-full h-auto object-cover"
              />
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-transparent pointer-events-none" />
            </div>
            {/* Decorative Elements */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-accent/10 blur-3xl rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
