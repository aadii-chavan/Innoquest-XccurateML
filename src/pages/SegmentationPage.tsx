import { useState, useEffect, useRef } from "react";
import { Upload, AlertCircle, CheckCircle, FileImage, ArrowLeft, Eye, Palette } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import ModelStatusIndicator from "@/components/ModelStatusIndicator";

const BACKEND_URL = "http://localhost:5000";

interface SliceData {
  slice_index: number;
  original_image: string;
  ground_truth_image?: string;
  combined_mask: string;
  core_probability: string;
  edema_probability: string;
  enhancing_probability: string;
}

const SegmentationPage = () => {
  const [t1ceFile, setT1cFile] = useState<File | null>(null);
  const [flairFile, setFlairFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [segmentationResult, setSegmentationResult] = useState<SliceData[] | null>(null);
  const [visualizationMode, setVisualizationMode] = useState<'combined' | 'core' | 'edema' | 'enhancing'>('combined');
  const [isDragging, setIsDragging] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (file: File, type: 't1c' | 'flair') => {
    if (file && (file.name.endsWith('.nii') || file.name.endsWith('.nii.gz'))) {
      if (type === 't1c') setT1cFile(file);
      if (type === 'flair') setFlairFile(file);
      setSegmentationResult(null);
    } else {
      toast({ title: 'Invalid File Format', description: 'Please upload .nii or .nii.gz files only.' });
    }
  };

  const handleDrop = (e: React.DragEvent, type: 't1c' | 'flair') => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file, type);
  };

  const handleAnalyze = async () => {
    if (!flairFile || !t1ceFile) {
      toast({ title: 'Missing Required Files', description: 'Please upload both FLAIR and T1CE files.' });
      return;
    }
    setIsAnalyzing(true);
    setSegmentationResult(null);
    try {
      const formData = new FormData();
      formData.append('flair_file', flairFile);
      formData.append('t1ce_file', t1ceFile);
      const res = await fetch(`${BACKEND_URL}/segment`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Segmentation failed');
      }
      const data = await res.json();
      setSegmentationResult(data);
      if (data) setTimeout(() => drawSegmentation(data), 100);
    } catch (e: any) {
      toast({ title: 'Segmentation Error', description: e.message || 'Failed to analyze images.' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const drawSegmentation = (sliceData: SliceData[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Load original image
    const originalImg = new Image();
    originalImg.onload = () => {
      // Draw original image as background
      ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);

      // Load and draw the selected visualization
      const maskImg = new Image();
      maskImg.onload = () => {
        // Create a temporary canvas for mask processing
        const maskCanvas = document.createElement('canvas');
        const maskCtx = maskCanvas.getContext('2d');
        if (!maskCtx) return;

        maskCanvas.width = maskImg.width;
        maskCanvas.height = maskImg.height;
        maskCtx.drawImage(maskImg, 0, 0);

        // Get image data for color mapping
        const imageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
        const data = imageData.data;

        // Apply color mapping based on visualization mode
        for (let i = 0; i < data.length; i += 4) {
          const pixelValue = data[i]; // Assuming grayscale, all channels are the same
          
          switch (visualizationMode) {
            case 'combined':
              // Color mapping with 50% opacity for combined view
              switch (pixelValue) {
                case 1: // NECROTIC/CORE - Red
                  data[i] = 255;     // R
                  data[i + 1] = 0;   // G
                  data[i + 2] = 0;   // B
                  data[i + 3] = 128; // A (50% opacity)
                  break;
                case 2: // EDEMA - Yellow
                  data[i] = 255;     // R
                  data[i + 1] = 255; // G
                  data[i + 2] = 0;   // B
                  data[i + 3] = 128; // A (50% opacity)
                  break;
                case 3: // ENHANCING - Green
                  data[i] = 0;       // R
                  data[i + 1] = 255; // G
                  data[i + 2] = 0;   // B
                  data[i + 3] = 128; // A (50% opacity)
                  break;
                case 0: // NOT tumor - Transparent
                  data[i + 3] = 0;   // A (fully transparent)
                  break;
                default:
                  data[i + 3] = 0;   // A (fully transparent)
                  break;
              }
              break;
              
            case 'core':
              // Red overlay for core/necrotic regions
              data[i] = 255;     // R
              data[i + 1] = 0;   // G
              data[i + 2] = 0;   // B
              data[i + 3] = pixelValue * 2.55; // A (based on probability)
              break;
              
            case 'edema':
              // Yellow overlay for edema regions
              data[i] = 255;     // R
              data[i + 1] = 255; // G
              data[i + 2] = 0;   // B
              data[i + 3] = pixelValue * 2.55; // A (based on probability)
              break;
              
            case 'enhancing':
              // Green overlay for enhancing regions
              data[i] = 0;       // R
              data[i + 1] = 255; // G
              data[i + 2] = 0;   // B
              data[i + 3] = pixelValue * 2.55; // A (based on probability)
              break;
          }
        }

        // Put the modified image data back
        maskCtx.putImageData(imageData, 0, 0);

        // Draw the colored mask on top of the original image
        ctx.drawImage(maskCanvas, 0, 0, canvas.width, canvas.height);
      };
      
      // Load the combined mask
      maskImg.src = `data:image/png;base64,${sliceData[0].combined_mask}`; // Assuming first slice for mask
    };
    originalImg.src = `data:image/png;base64,${sliceData[0].original_image}`; // Assuming first slice for original
  };

  const handleVisualizationModeChange = (mode: 'combined' | 'core' | 'edema' | 'enhancing') => {
    setVisualizationMode(mode);
    if (segmentationResult) {
      drawSegmentation(segmentationResult);
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
        <div className="max-w-7xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Multi-Sequence Brain Tumor Segmentation
            </h1>
            <p className="text-xl text-muted-foreground">
              Upload T1, T1c, T2, and FLAIR NIfTI files (.nii or .nii.gz) for comprehensive AI-powered tumor analysis
            </p>
          </div>

          <div className="flex justify-center mb-4">
            <ModelStatusIndicator showDetails={true} />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div className="space-y-6">
              {/* T1 File Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">T1 Image (Optional)</h3>
                <div
                  onDrop={(e) => handleDrop(e, 't1c')}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                    isDragging
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-accent/50"
                  }`}
                >
                  {t1ceFile ? (
                    <div className="space-y-2">
                      <FileImage className="w-8 h-8 mx-auto text-accent" />
                      <p className="text-sm font-medium">{t1ceFile.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                      <p className="text-sm">Drop T1 file here or click to browse</p>
                      <input
                        type="file"
                        accept=".nii,.nii.gz"
                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 't1c')}
                        className="hidden"
                        id="t1-upload"
                      />
                      <label htmlFor="t1-upload" className="inline-block">
                        <span className="inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-accent text-accent hover:bg-accent/10 h-10 px-4 text-sm cursor-pointer">
                          Select T1 File
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* T1c File Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">T1c Image (Required) <span className="text-red-500">*</span></h3>
                <div
                  onDrop={(e) => handleDrop(e, 'flair')}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                    isDragging
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-accent/50"
                  }`}
                >
                  {flairFile ? (
                    <div className="space-y-2">
                      <FileImage className="w-8 h-8 mx-auto text-accent" />
                      <p className="text-sm font-medium">{flairFile.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                      <p className="text-sm">Drop FLAIR file here or click to browse</p>
                      <input
                        type="file"
                        accept=".nii,.nii.gz"
                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'flair')}
                        className="hidden"
                        id="flair-upload"
                      />
                      <label htmlFor="flair-upload" className="inline-block">
                        <span className="inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-accent text-accent hover:bg-accent/10 h-10 px-4 text-sm cursor-pointer">
                          Select FLAIR File
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* T2 File Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">T2 Image (Optional)</h3>
                <div
                  onDrop={(e) => handleDrop(e, 't2')}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                    isDragging
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-accent/50"
                  }`}
                >
                  {/* T2 file upload removed as per backend contract */}
                </div>
              </div>

              {/* FLAIR File Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">FLAIR Image (Required) <span className="text-red-500">*</span></h3>
                <div
                  onDrop={(e) => handleDrop(e, 'flair')}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                    isDragging
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-accent/50"
                  }`}
                >
                  {flairFile ? (
                    <div className="space-y-2">
                      <FileImage className="w-8 h-8 mx-auto text-accent" />
                      <p className="text-sm font-medium">{flairFile.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                      <p className="text-sm">Drop FLAIR file here or click to browse</p>
                      <input
                        type="file"
                        accept=".nii,.nii.gz"
                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'flair')}
                        className="hidden"
                        id="flair-upload"
                      />
                      <label htmlFor="flair-upload" className="inline-block">
                        <span className="inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-accent text-accent hover:bg-accent/10 h-10 px-4 text-sm cursor-pointer">
                          Select FLAIR File
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {flairFile && t1ceFile && (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full"
                >
                  {isAnalyzing ? "Analyzing..." : "Run Multi-Sequence Analysis"}
                </Button>
              )}

              <div className="bg-muted/20 rounded-lg p-4 text-sm text-muted-foreground">
                <p className="font-semibold mb-2">Supported formats:</p>
                <p>NIfTI files (.nii or .nii.gz) - T1, T1c, T2, FLAIR</p>
                <p className="mt-2 text-xs">
                  <span className="text-red-500">*</span> Required: T1c and FLAIR | Optional: T1, T2
                </p>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {isAnalyzing && (
                <div className="border border-border rounded-lg p-8 text-center">
                  <div className="animate-spin w-12 h-12 border-4 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-lg font-semibold">Processing Segmentation...</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Analyzing 3D MRI volumes with AI segmentation models
                  </p>
                </div>
              )}

              {segmentationResult && !isAnalyzing && (
                <div className="space-y-4">
                  {/* Visualization Mode Selector */}
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Visualization Mode
                    </h4>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant={visualizationMode === 'combined' ? "primary" : "secondary"}
                        size="sm"
                        onClick={() => handleVisualizationModeChange('combined')}
                      >
                        Combined
                      </Button>
                      <Button
                        variant={visualizationMode === 'core' ? "primary" : "secondary"}
                        size="sm"
                        onClick={() => handleVisualizationModeChange('core')}
                      >
                        Core/Necrotic
                      </Button>
                      <Button
                        variant={visualizationMode === 'edema' ? "primary" : "secondary"}
                        size="sm"
                        onClick={() => handleVisualizationModeChange('edema')}
                      >
                        Edema
                      </Button>
                      <Button
                        variant={visualizationMode === 'enhancing' ? "primary" : "secondary"}
                        size="sm"
                        onClick={() => handleVisualizationModeChange('enhancing')}
                      >
                        Enhancing
                      </Button>
                    </div>
                  </div>

                  {/* Single Display */}
                  <div className="border border-border rounded-lg p-4 bg-card">
                    <div className="flex items-center gap-2 mb-4">
                      <Palette className="w-4 h-4" />
                      <h4 className="font-semibold">Segmentation Result</h4>
                    </div>
                    
                    {/* Single panel layout */}
                    <div className="space-y-2">
                      {/* Original FLAIR */}
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-center">Original FLAIR</h5>
                        <div className="border border-border rounded p-2 bg-background">
                          <img
                            src={`data:image/png;base64,${segmentationResult[0].original_image}`}
                            alt="Original FLAIR"
                            className="w-full h-32 object-contain"
                          />
                        </div>
                      </div>

                      {/* Combined Mask Overlay */}
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-center">Segmentation Mask</h5>
                        <div className="border border-border rounded p-2 bg-background">
                          <canvas ref={canvasRef} width="256" height="256"></canvas>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comprehensive Legend */}
                  <div className="border border-border rounded-lg p-4 bg-card">
                    <h4 className="font-semibold mb-3">Visualization Guide</h4>
                    <div className="space-y-4 text-sm">
                      {/* Segmentation Colors */}
                      <div>
                        <h5 className="font-medium mb-2">Segmentation Colors:</h5>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-500 rounded opacity-50"></div>
                            <span>Red: Necrotic/Core</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-yellow-500 rounded opacity-50"></div>
                            <span>Yellow: Edema</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500 rounded opacity-50"></div>
                            <span>Green: Enhancing Tumor</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-500 rounded opacity-50"></div>
                            <span>Transparent: Normal Tissue</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Nilearn Plot Types */}
                      <div>
                        <h5 className="font-medium mb-2">Nilearn-Style Plots:</h5>
                        <div className="space-y-1">
                          <div><span className="font-medium">Anatomical Plot:</span> Standard anatomical visualization</div>
                          <div><span className="font-medium">EPI Plot:</span> Histogram equalized for better contrast</div>
                          <div><span className="font-medium">Image Plot:</span> Gamma corrected for enhanced visibility</div>
                          <div><span className="font-medium">ROI Plot:</span> Colored overlay on anatomical background (requires ground truth)</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      setT1cFile(null);
                      setFlairFile(null);
                      setSegmentationResult(null);
                    }}
                  >
                    New Analysis
                  </Button>
                </div>
              )}

              {!segmentationResult && !isAnalyzing && (
                <div className="border border-border rounded-lg p-8 text-center text-muted-foreground">
                  <FileImage className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Upload T1c and FLAIR files (minimum) to see segmentation results</p>
                  <p className="text-sm mt-2">T1 and T2 files are optional but recommended for better accuracy</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SegmentationPage;
