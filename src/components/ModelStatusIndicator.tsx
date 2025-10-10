import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader2, Brain, Scan } from "lucide-react";

interface ModelStatus {
  classification_model_loaded: boolean;
  segmentation_model_loaded: boolean;
  status: string;
  input_shape?: number[];
}

interface ModelStatusIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

const ModelStatusIndicator = ({ className = "", showDetails = false }: ModelStatusIndicatorProps) => {
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const checkModelStatus = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await fetch("http://localhost:5002/status");
        
        if (!response.ok) {
          throw new Error("Failed to connect to backend");
        }
        
        const data = await response.json();
        setModelStatus(data);
      } catch (err: any) {
        setError(err.message || "Connection failed");
        setModelStatus(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkModelStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkModelStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const allModelsLoaded = modelStatus?.classification_model_loaded && modelStatus?.segmentation_model_loaded;

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Checking models...</span>
      </div>
    );
  }

  if (error || !modelStatus) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <XCircle className="w-4 h-4 text-red-500" />
        <span className="text-sm text-red-500">Models disconnected</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {allModelsLoaded ? (
        <>
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-600 font-medium">Models Connected</span>
        </>
      ) : (
        <>
          <XCircle className="w-4 h-4 text-yellow-500" />
          <span className="text-sm text-yellow-600">Partial Connection</span>
        </>
      )}
      
      {showDetails && modelStatus && (
        <div className="ml-4 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Brain className="w-3 h-3" />
            <span className={modelStatus.classification_model_loaded ? "text-green-600" : "text-red-500"}>
              Classification
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Scan className="w-3 h-3" />
            <span className={modelStatus.segmentation_model_loaded ? "text-green-600" : "text-red-500"}>
              Segmentation
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelStatusIndicator;
