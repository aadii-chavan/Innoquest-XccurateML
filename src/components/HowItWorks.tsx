import { Upload, Cpu, FileCheck } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      icon: <Upload size={32} />,
      title: "Upload Medical Images",
      description:
        "Securely upload DICOM files, X-rays, CT scans, or MRI images through our HIPAA-compliant platform.",
    },
    {
      number: "02",
      icon: <Cpu size={32} />,
      title: "AI Analysis",
      description:
        "Our deep learning models analyze images in real-time, detecting patterns and anomalies with clinical precision.",
    },
    {
      number: "03",
      icon: <FileCheck size={32} />,
      title: "Receive Results",
      description:
        "Get comprehensive diagnostic reports with confidence scores, annotations, and clinical recommendations within minutes.",
    },
  ];

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-card/30 to-background">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to transform your diagnostic workflow
          </p>
        </div>

        {/* Steps */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line (hidden on mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-24 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-accent to-accent/20" />
              )}

              {/* Step Card */}
              <div className="relative group">
                {/* Number Badge */}
                <div className="absolute -top-6 left-6 w-16 h-16 rounded-full bg-accent/10 border-2 border-accent flex items-center justify-center">
                  <span className="text-2xl font-bold text-accent">
                    {step.number}
                  </span>
                </div>

                {/* Card Content */}
                <div className="pt-14 p-8 rounded-2xl bg-card border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-clinical h-full">
                  {/* Icon */}
                  <div className="mb-6 text-accent">{step.icon}</div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold mb-4">{step.title}</h3>

                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="inline-block p-8 rounded-2xl bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/30">
            <h3 className="text-2xl font-bold mb-4">
              Ready to transform your diagnostics?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-xl">
              Join leading healthcare institutions using Xccurate-ML for faster, 
              more accurate diagnoses.
            </p>
            <button className="inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 bg-accent text-accent-foreground hover:bg-accent/90 shadow-clinical hover:shadow-glow h-12 px-8">
              Request a Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
