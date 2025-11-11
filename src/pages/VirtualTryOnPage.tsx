import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Download, ShoppingCart, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera as CameraUtils } from '@mediapipe/camera_utils';
import { api } from '@/api/ApiFacade';
import { Product } from '@/models/ProductModel';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

const VirtualTryOnPage = () => {
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceShape, setFaceShape] = useState<string>('');
  const [recommendedShapes, setRecommendedShapes] = useState<string[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const faceMeshRef = useRef<FaceMesh | null>(null);
  const cameraRef = useRef<CameraUtils | null>(null);
  
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await api.getProducts();
        if (response.success) {
          const eyewearProducts = response.data.filter(
            p => p.category === 'eyeglasses' || p.category === 'sunglasses'
          );
          setProducts(eyewearProducts);
          if (eyewearProducts.length > 0) {
            setSelectedProduct(eyewearProducts[0]);
          }
        }
      } catch (error) {
        console.error('Error loading products:', error);
        toast.error('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Initialize camera and face detection
  const initializeCamera = async () => {
    try {
      setIsLoading(true);
      setCameraEnabled(true);

      // Wait for the video element to mount in the next render cycle
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const videoEl = videoRef.current;
      const canvasEl = canvasRef.current;
      const overlayEl = overlayCanvasRef.current;

      if (!videoEl || !canvasEl || !overlayEl) {
        console.error('Camera elements not yet ready');
        toast.error('Camera elements not ready. Please try again.');
        setCameraEnabled(false);
        setIsLoading(false);
        return;
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 1280, height: 720 },
        audio: false,
      });

      // Attach stream
      videoEl.srcObject = stream;
      videoEl.muted = true;
      videoEl.playsInline = true;

      await videoEl.play();
      console.log('✅ Camera stream started.');

      // Adjust canvas sizes
      canvasEl.width = videoEl.videoWidth;
      canvasEl.height = videoEl.videoHeight;
      overlayEl.width = videoEl.videoWidth;
      overlayEl.height = videoEl.videoHeight;

      // Initialize FaceMesh
      const faceMesh = new FaceMesh({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults(onFaceDetected);
      faceMeshRef.current = faceMesh;

      // Use CameraUtils for frame processing
      const camera = new CameraUtils(videoEl, {
        onFrame: async () => {
          if (faceMeshRef.current) {
            await faceMeshRef.current.send({ image: videoEl });
          }
        },
        width: 1280,
        height: 720,
      });

      camera.start();
      cameraRef.current = camera;

      toast.success('Camera enabled! Position your face in the frame.');
    } catch (err) {
      console.error('🚨 Camera initialization failed:', err);
      if (err.name === 'NotAllowedError') {
        toast.error('Camera permission denied. Please allow camera access.');
      } else if (err.name === 'NotFoundError') {
        toast.error('No camera device found.');
      } else {
        toast.error('Failed to access camera. Check console for details.');
      }
      setCameraEnabled(false);
    } finally {
      setIsLoading(false);
    }
  };


  // Analyze face shape from landmarks
  const analyzeFaceShape = (landmarks: any[]): string => {
    // Key landmark indices for face shape analysis
    const leftCheek = landmarks[234];
    const rightCheek = landmarks[454];
    const topHead = landmarks[10];
    const chin = landmarks[152];
    const leftJaw = landmarks[172];
    const rightJaw = landmarks[397];
    const leftForehead = landmarks[21];
    const rightForehead = landmarks[251];

    // Calculate face dimensions
    const faceWidth = Math.abs(rightCheek.x - leftCheek.x);
    const faceLength = Math.abs(chin.y - topHead.y);
    const jawWidth = Math.abs(rightJaw.x - leftJaw.x);
    const foreheadWidth = Math.abs(rightForehead.x - leftForehead.x);
    const cheekboneWidth = faceWidth;

    // Calculate ratios
    const lengthToWidthRatio = faceLength / faceWidth;
    const jawToForeheadRatio = jawWidth / foreheadWidth;
    const jawToCheekRatio = jawWidth / cheekboneWidth;

    // Determine face shape based on ratios
    if (lengthToWidthRatio >= 1.35) {
      // Long face
      if (jawToCheekRatio < 0.9) {
        return 'heart';
      }
      return 'oval';
    } else if (lengthToWidthRatio <= 1.15) {
      // Wider face
      if (jawToForeheadRatio >= 0.95) {
        return 'square';
      }
      return 'round';
    } else {
      // Balanced proportions
      if (jawToCheekRatio < 0.85) {
        return 'heart';
      } else if (jawToForeheadRatio >= 0.95) {
        return 'square';
      }
      return 'oval';
    }
  };

  // Get frame recommendations based on face shape
  const getFrameRecommendations = (shape: string): string[] => {
    const recommendations: { [key: string]: string[] } = {
      oval: ['Rectangle', 'Aviator', 'Square', 'Cat-Eye', 'Wayfarer'],
      round: ['Rectangle', 'Square', 'Geometric', 'Angular'],
      square: ['Round', 'Oval', 'Aviator', 'Cat-Eye'],
      heart: ['Aviator', 'Cat-Eye', 'Round', 'Oval', 'Rimless']
    };
    return recommendations[shape] || [];
  };

  // Get face shape description
  const getFaceShapeDescription = (shape: string): string => {
    const descriptions: { [key: string]: string } = {
      oval: 'Balanced proportions with gentle curves. Lucky you - most frames will look great!',
      round: 'Soft curves with similar width and length. Angular frames will add definition.',
      square: 'Strong jawline with similar width at forehead and jaw. Rounded frames will soften features.',
      heart: 'Wider forehead, narrower chin. Frames that are wider at the bottom will balance your features.'
    };
    return descriptions[shape] || 'Analyzing...';
  };

  // Draw glasses overlay on detected face
  const onFaceDetected = (results: any) => {
    if (!overlayCanvasRef.current || !selectedProduct) return;

    const canvas = overlayCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      setFaceDetected(true);
      const landmarks = results.multiFaceLandmarks[0];

      // Analyze face shape (throttle to avoid constant updates)
      if (!faceShape) {
        const detectedShape = analyzeFaceShape(landmarks);
        setFaceShape(detectedShape);
        const recommendations = getFrameRecommendations(detectedShape);
        setRecommendedShapes(recommendations);
        toast.success(`Face shape detected: ${detectedShape.charAt(0).toUpperCase() + detectedShape.slice(1)}!`, {
          description: 'We found the best frame styles for you.'
        });
      }

      // Get key face landmarks for glasses positioning
      // Left eye outer corner: 33, Right eye outer corner: 263
      // Left eye inner corner: 133, Right eye inner corner: 362
      const leftEyeOuter = landmarks[33];
      const rightEyeOuter = landmarks[263];
      const leftEyeInner = landmarks[133];
      const rightEyeInner = landmarks[362];
      const noseTip = landmarks[1];

      // Calculate glasses dimensions and position
      const eyeDistance = Math.sqrt(
        Math.pow((rightEyeOuter.x - leftEyeOuter.x) * canvas.width, 2) +
        Math.pow((rightEyeOuter.y - leftEyeOuter.y) * canvas.height, 2)
      );

      const glassesWidth = eyeDistance * 1.5;
      const glassesHeight = glassesWidth * 0.4;

      // Calculate center position between eyes
      const centerX = ((leftEyeOuter.x + rightEyeOuter.x) / 2) * canvas.width;
      const centerY = ((leftEyeOuter.y + rightEyeOuter.y) / 2) * canvas.height;

      // Calculate angle for proper alignment
      const angle = Math.atan2(
        (rightEyeOuter.y - leftEyeOuter.y) * canvas.height,
        (rightEyeOuter.x - leftEyeOuter.x) * canvas.width
      );

      // Draw glasses frame overlay (simplified representation)
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);

      // Draw frame outline
      ctx.strokeStyle = selectedProduct.category === 'sunglasses' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(100, 100, 100, 0.7)';
      ctx.fillStyle = selectedProduct.category === 'sunglasses' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(200, 200, 200, 0.2)';
      ctx.lineWidth = 4;

      // Left lens
      ctx.beginPath();
      ctx.ellipse(-glassesWidth / 4, 0, glassesWidth / 3, glassesHeight / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Right lens
      ctx.beginPath();
      ctx.ellipse(glassesWidth / 4, 0, glassesWidth / 3, glassesHeight / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Bridge
      ctx.beginPath();
      ctx.moveTo(-glassesWidth / 12, 0);
      ctx.lineTo(glassesWidth / 12, 0);
      ctx.stroke();

      // Temples (arms)
      ctx.beginPath();
      ctx.moveTo(-glassesWidth / 2 + 10, 0);
      ctx.lineTo(-glassesWidth / 2 - 30, 10);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(glassesWidth / 2 - 10, 0);
      ctx.lineTo(glassesWidth / 2 + 30, 10);
      ctx.stroke();

      ctx.restore();

      // Draw product name
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(10, 10, 250, 40);
      ctx.fillStyle = '#000';
      ctx.font = 'bold 16px Inter';
      ctx.fillText(selectedProduct.name, 20, 35);
    } else {
      setFaceDetected(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Take screenshot
  const takeScreenshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const videoEl = videoRef.current;
    const overlayCanvas = overlayCanvasRef.current;

    // Create an offscreen canvas for the non-mirrored output
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = videoEl.videoWidth;
    outputCanvas.height = videoEl.videoHeight;
    const ctx = outputCanvas.getContext('2d');

    if (!ctx) return;

    // Draw the non-mirrored video frame
    ctx.save();
    ctx.scale(-1, 1); // flip horizontally back
    ctx.drawImage(videoEl, -outputCanvas.width, 0, outputCanvas.width, outputCanvas.height);
    ctx.restore();

    // Draw overlays (if any)
    if (overlayCanvas) {
      ctx.drawImage(overlayCanvas, 0, 0, outputCanvas.width, outputCanvas.height);
    }

    // Download the result
    const image = outputCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = 'virtual-tryon.png';
    link.click();

    toast.success('📸 Screenshot saved without mirror effect!');
  };


  // Navigate products
  const handlePrevProduct = () => {
    if (!selectedProduct) return;
    const currentIndex = products.findIndex(p => p.id === selectedProduct.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : products.length - 1;
    setSelectedProduct(products[prevIndex]);
  };

  const handleNextProduct = () => {
    if (!selectedProduct) return;
    const currentIndex = products.findIndex(p => p.id === selectedProduct.id);
    const nextIndex = currentIndex < products.length - 1 ? currentIndex + 1 : 0;
    setSelectedProduct(products[nextIndex]);
  };

  const handleAddToCart = () => {
    if (selectedProduct) {
      addToCart(selectedProduct);
      toast.success(`${selectedProduct.name} added to cart!`);
    }
  };

  // Get filtered products based on recommendations
  const getRecommendedProducts = () => {
    if (!showRecommendations || recommendedShapes.length === 0) {
      return products;
    }
    return products.filter(p => recommendedShapes.includes(p.shape));
  };

  const displayProducts = getRecommendedProducts();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Virtual Try-On</h1>
            <p className="text-lg text-muted-foreground">
              See how frames look on your face in real-time
            </p>
          </div>

          {!cameraEnabled ? (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-12 text-center">
                <Camera className="h-24 w-24 mx-auto text-primary mb-6" />
                <h2 className="text-2xl font-semibold mb-4">Enable Camera to Start</h2>
                <p className="text-muted-foreground mb-8">
                  We'll use your camera to show how different frames look on your face.
                  Your images are not stored or transmitted.
                </p>
                <Button size="lg" onClick={initializeCamera} disabled={isLoading}>
                  <Camera className="mr-2 h-5 w-5" />
                  Enable Camera
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Camera View */}
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="p-0 relative">
                    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                      <video
                        ref={videoRef}
                        className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                        autoPlay
                        muted
                        playsInline
                      />
                      <canvas
                        ref={canvasRef}
                        className="hidden"
                      />
                      <canvas
                        ref={overlayCanvasRef}
                        className="absolute inset-0 w-full h-full scale-x-[-1]"
                      />
                      
                      {/* Face detection indicator */}
                      <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 px-3 py-2 rounded-full">
                        <div className={`w-2 h-2 rounded-full ${faceDetected ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-white text-sm">
                          {faceDetected ? 'Face Detected' : 'Looking for face...'}
                        </span>
                      </div>

                      {/* Controls */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                        <Button
                          size="lg"
                          variant="secondary"
                          onClick={takeScreenshot}
                          disabled={!faceDetected}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Screenshot
                        </Button>
                        <Button
                          size="lg"
                          onClick={handleAddToCart}
                          disabled={!selectedProduct}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Product Selection */}
              <div className="space-y-4">
                {/* Face Shape Analysis */}
                {faceShape && (
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-sm mb-1">
                            Your Face Shape: {faceShape.charAt(0).toUpperCase() + faceShape.slice(1)}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {getFaceShapeDescription(faceShape)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-xs font-medium mb-2">Recommended frame shapes:</p>
                        <div className="flex flex-wrap gap-1">
                          {recommendedShapes.map(shape => (
                            <span
                              key={shape}
                              className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                            >
                              {shape}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-primary/10">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showRecommendations}
                            onChange={(e) => setShowRecommendations(e.target.checked)}
                            className="rounded border-primary/30"
                          />
                          <span className="text-xs">Show only recommended</span>
                        </label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setFaceShape('');
                            setRecommendedShapes([]);
                            setShowRecommendations(false);
                          }}
                          className="h-7 text-xs"
                        >
                          Re-analyze
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Try Different Frames</h3>
                      {showRecommendations && (
                        <span className="text-xs text-primary font-medium">
                          {displayProducts.length} recommended
                        </span>
                      )}
                    </div>
                    
                    {selectedProduct && (
                      <div className="space-y-4">
                        <div className="relative">
                          <img
                            src={selectedProduct.image}
                            alt={selectedProduct.name}
                            className="w-full rounded-lg"
                          />
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-lg">{selectedProduct.name}</h4>
                          <p className="text-sm text-muted-foreground">{selectedProduct.brand}</p>
                          <p className="text-xl font-bold text-primary mt-2">
                            ${selectedProduct.price}
                          </p>
                        </div>

                        <div className="flex justify-between gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={handlePrevProduct}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => navigate(`/product/${selectedProduct.id}`)}
                          >
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={handleNextProduct}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Product Grid */}
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3 text-sm">
                      {showRecommendations ? 'Recommended for You' : 'More Options'}
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {displayProducts.slice(0, 9).map(product => (
                        <button
                          key={product.id}
                          onClick={() => setSelectedProduct(product)}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                            selectedProduct?.id === product.id
                              ? 'border-primary ring-2 ring-primary/20'
                              : 'border-transparent hover:border-muted-foreground/20'
                          }`}
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                          {recommendedShapes.includes(product.shape) && (
                            <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                              ✓
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-12 grid md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-2">📸</div>
                <h4 className="font-semibold mb-2">Real-Time Preview</h4>
                <p className="text-sm text-muted-foreground">
                  See frames on your face instantly
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-2">🧠</div>
                <h4 className="font-semibold mb-2">Face Shape Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  AI detects your face shape for personalized recommendations
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-2">🔄</div>
                <h4 className="font-semibold mb-2">Compare Styles</h4>
                <p className="text-sm text-muted-foreground">
                  Switch between frames instantly
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-2">💾</div>
                <h4 className="font-semibold mb-2">Save & Share</h4>
                <p className="text-sm text-muted-foreground">
                  Take screenshots of your looks
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VirtualTryOnPage;
