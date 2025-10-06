import { ShieldCheck, CheckCircle2 } from "lucide-react";

const Standards = () => {
  const compliance = [
    "HIPAA Compliant",
    "FDA 510(k) Cleared",
    "CE Marked (EU)",
    "ISO 13485 Certified",
    "SOC 2 Type II",
    "GDPR Ready",
  ];

  const metrics = [
    { value: "2M+", label: "Images Analyzed" },
    { value: "500+", label: "Hospital Partners" },
    { value: "50+", label: "Conditions Detected" },
    { value: "24/7", label: "Clinical Support" },
  ];

  return (
    <section id="about" className="py-24 px-6">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Compliance */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                Built on <span className="text-gradient">Trust</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Meeting the highest standards in medical AI with comprehensive regulatory compliance
              </p>
            </div>

            <div className="space-y-4">
              {compliance.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border hover:border-accent/50 transition-colors"
                >
                  <ShieldCheck className="text-accent flex-shrink-0" size={24} />
                  <span className="text-foreground font-medium">{item}</span>
                  <CheckCircle2 className="ml-auto text-accent" size={20} />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Metrics Grid */}
          <div className="space-y-8">
            <div>
              <h3 className="text-3xl font-bold mb-4">
                Proven at <span className="text-gradient">Scale</span>
              </h3>
              <p className="text-lg text-muted-foreground">
                Trusted by leading healthcare institutions worldwide
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {metrics.map((metric, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl bg-gradient-to-br from-card to-accent/5 border border-border"
                >
                  <div className="text-4xl font-bold text-accent mb-2">
                    {metric.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Trust Badge */}
            <div className="p-6 rounded-xl bg-accent/10 border border-accent/30">
              <div className="flex items-start gap-4">
                <ShieldCheck className="text-accent flex-shrink-0 mt-1" size={32} />
                <div>
                  <h4 className="font-semibold text-lg mb-2">Enterprise Security</h4>
                  <p className="text-sm text-muted-foreground">
                    Bank-level encryption, regular audits, and continuous monitoring 
                    ensure your data remains secure and compliant.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Standards;
