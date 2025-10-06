const Footer = () => {
  return (
    <footer id="contact" className="border-t border-border bg-card/50 py-8 px-6">
      <div className="container mx-auto">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">
            © {new Date().getFullYear()} Xccurate-ML. All rights reserved. 
            <span className="mx-2">|</span>
            FDA-cleared and HIPAA-compliant medical AI diagnostics.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
