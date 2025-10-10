import { useState, useEffect } from "react";
import { Upload, AlertCircle, CheckCircle, FileImage, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const BACKEND_URL = "http://localhost:5000";

const ScanPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [backendStatus, setBackendStatus] = useState<"checking"|"ok"|"error">("checking");
  const [backendError, setBackendError] = useState<string>("");

  useEffect(() => {
    // Check backend/model status on mount
    const checkStatus = async () => {
      setBackendStatus("checking");
      setBackendError("");
      try {
        const res = await fetch(`${BACKEND_URL}/status`);
        if (!res.ok) throw new Error("Model not loaded");
        const data = await res.json();
        if (data.status === "ok" && data.model_loaded) {
          setBackendStatus("ok");
        } else {
          setBackendStatus("error");
          setBackendError(data.error || "Model not loaded");
        }
      } catch (e: any) {
        setBackendStatus("error");
        setBackendError(e.message || "Could not connect to backend");
      }
    };
    checkStatus();
  }, []);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const res = await fetch(`${BACKEND_URL}/classify`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Prediction failed");
      }
      const data = await res.json();
      setResult({
        diagnosis: data.predicted_class,
        confidence: Math.round(data.confidence * 1000) / 10, // e.g. 0.947 -> 94.7
        findings: Object.entries(data.all_class_probabilities).map(([type, confidence]) => ({
          type,
          region: type,
          confidence: Math.round((confidence as number) * 1000) / 10,
        })),
        recommendations: [
          "Consult a healthcare professional for further evaluation.",
          "Review the scan and clinical history.",
        ],
      });
    } catch (e: any) {
      toast({
        title: "Prediction Error",
        description: e.message || "Failed to analyze image.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Medical Image Analysis
            </h1>
            <p className="text-xl text-muted-foreground">
              Upload a medical scan for instant AI-powered diagnostic assistance
            </p>
          </div>

          <div className="flex justify-center mb-4">
            {backendStatus === "checking" && (
              <span className="text-sm text-muted-foreground">Checking model status...</span>
            )}
            {backendStatus === "ok" && (
              <span className="text-sm text-green-600">Model loaded and ready</span>
            )}
            {backendStatus === "error" && (
              <span className="text-sm text-red-600">Backend error: {backendError}</span>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div className="space-y-6">
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                  isDragging
                    ? "border-accent bg-accent/5"
                    : "border-border hover:border-accent/50"
                }`}
              >
                {previewUrl ? (
                  <div className="space-y-4">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <FileImage className="w-4 h-4" />
                      <span>{selectedFile?.name}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-16 h-16 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-lg font-semibold mb-2">
                        Drop your medical image here
                      </p>
                      <p className="text-sm text-muted-foreground">
                        or click to browse
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="inline-block">
                      <span className="inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border-2 border-accent text-accent hover:bg-accent/10 h-14 px-8 py-3 text-lg cursor-pointer">
                        Select Image
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {selectedFile && (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full"
                >
                  {isAnalyzing ? "Analyzing..." : "Run Analysis"}
                </Button>
              )}

              <div className="bg-muted/20 rounded-lg p-4 text-sm text-muted-foreground">
                <p className="font-semibold mb-2">Supported formats:</p>
                <p>DICOM, JPG, PNG (X-Ray, CT, MRI)</p>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {isAnalyzing && (
                <div className="border border-border rounded-lg p-8 text-center">
                  <div className="animate-spin w-12 h-12 border-4 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-lg font-semibold">Analyzing Image...</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Processing with AI diagnostic models
                  </p>
                </div>
              )}

              {result && !isAnalyzing && (
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full mb-4"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl("");
                    setResult(null);
                  }}
                >
                  New Analysis
                </Button>
              )}

              {result && !isAnalyzing && (
                <div className="space-y-4">
                  {/* Primary Diagnosis */}
                  <div className="border border-border rounded-lg p-6 bg-card">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-accent/10 rounded-full">
                        <CheckCircle className="w-6 h-6 text-accent" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{result.diagnosis}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Confidence:</span>
                          <span className="text-accent font-semibold">{result.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Findings */}
                  <div className="border border-border rounded-lg p-6 bg-card">
                    <h4 className="font-bold mb-4 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-accent" />
                      Detailed Findings
                    </h4>
                    <div className="space-y-3">
                      {result.findings.map((finding: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                          <div>
                            <p className="font-semibold">{finding.region}</p>
                            <p className="text-sm text-muted-foreground">{finding.type}</p>
                          </div>
                          <span className="text-sm text-accent font-semibold">
                            {finding.confidence}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="border border-border rounded-lg p-6 bg-card">
                    <h4 className="font-bold mb-4">Recommendations</h4>
                    <ul className="space-y-2">
                      {result.recommendations.map((rec: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-muted/20 rounded-lg p-4 text-xs text-muted-foreground">
                    <p className="font-semibold mb-1">⚠️ Medical Disclaimer</p>
                    <p>
                      This is an AI-assisted analysis tool. Results should be reviewed by a qualified healthcare professional before making any medical decisions.
                    </p>
                  </div>
                </div>
              )}

              {!result && !isAnalyzing && (
                <div className="border border-border rounded-lg p-8 text-center text-muted-foreground">
                  <FileImage className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Upload and analyze an image to see results</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanPage;
