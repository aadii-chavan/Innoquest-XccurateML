import { BrainCircuit, Target, Zap, Shield } from "lucide-react";

interface CapabilityCardProps {
  icon: React.ReactNode;
  value: string;
  description: string;
}

const CapabilityCard = ({ icon, value, description }: CapabilityCardProps) => {
  return (
    <div className="relative group p-8 rounded-2xl bg-card border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-clinical">
      {/* Icon */}
      <div className="mb-4 text-accent">{icon}</div>
      
      {/* Value */}
      <div className="text-5xl font-bold text-accent mb-2">{value}</div>
      
      {/* Description */}
      <p className="text-muted-foreground">{description}</p>

      {/* Hover Glow */}
      <div className="absolute inset-0 rounded-2xl bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
    </div>
  );
};

const Capabilities = () => {
  const capabilities = [
    {
      icon: <BrainCircuit size={40} />,
      value: "98.7%",
      description: "Diagnostic accuracy across 50+ conditions",
    },
    {
      icon: <Target size={40} />,
      value: "45%",
      description: "Earlier detection compared to traditional methods",
    },
    {
      icon: <Zap size={40} />,
      value: "<2min",
      description: "Average analysis time per scan",
    },
    {
      icon: <Shield size={40} />,
      value: "100%",
      description: "HIPAA compliant and FDA-cleared",
    },
  ];

  return (
    <section id="features" className="py-24 px-6 bg-gradient-to-b from-background to-card/30">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold">
            Clinical-Grade <span className="text-gradient">Performance</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Delivering precision and reliability that healthcare professionals trust
          </p>
        </div>

        {/* Capability Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {capabilities.map((capability, index) => (
            <CapabilityCard
              key={index}
              icon={capability.icon}
              value={capability.value}
              description={capability.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Capabilities;
