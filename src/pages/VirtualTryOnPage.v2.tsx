import { useState, useRef, useEffect } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Camera as CameraIcon, Upload, RefreshCw } from 'lucide-react';
import { Product } from '@/models/ProductModel';
import { api } from '@/api/ApiFacade';

const TryOnPhotoPage2 = () => {
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [photoMode, setPhotoMode] = useState(false);
  const [photoImage, setPhotoImage] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const faceMeshRef = useRef<FaceMesh | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const productImageRef = useRef<HTMLImageElement | null>(null);

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await api.getProducts();
        if (response.success) {
          const eyewearProducts = response.data.filter(
            (p: Product) =>
              p.category === 'eyeglasses' || p.category === 'sunglasses'
          );
          setProducts(eyewearProducts);
          if (eyewearProducts.length > 0) {
            setSelectedProduct(eyewearProducts[0]);
          }
        }
      } catch (error) {
        console.error('Error loading products:', error);
        toast.error('Failed to load products');
      }
    };
    loadProducts();
  }, []);

  // Cache selected product image
  useEffect(() => {
    if (selectedProduct) {
      const img = new Image();
      img.src = selectedProduct.image;
      productImageRef.current = img;
    }
  }, [selectedProduct]);

  // Initialize camera for capturing photo
  const startCamera = async () => {
    try {
      setIsLoading(true);
      setCameraEnabled(true);
      const video = videoRef.current;
      if (!video) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 1280, height: 720 },
        audio: false,
      });
      video.srcObject = stream;
      video.play();
      toast.success('Camera ready!');
    } catch (err: any) {
      console.error(err);
      toast.error('Camera access denied or not found.');
    } finally {
      setIsLoading(false);
    }
  };

  // Capture photo from camera
  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Non-mirrored
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

    const imageData = canvas.toDataURL('image/png');
    setPhotoImage(imageData);
    setPhotoMode(true);

    // Stop camera
    if (video.srcObject) {
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    }
    setCameraEnabled(false);
    toast.info('Photo captured! Detecting face...');
  };

  // Handle photo upload
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoImage(event.target?.result as string);
      setPhotoMode(true);
      toast.info('Photo uploaded! Detecting face...');
    };
    reader.readAsDataURL(file);
  };

  // FaceMesh detection for photo
  useEffect(() => {
    if (!photoMode || !photoImage) return;

    const runFaceMesh = async () => {
      const img = new Image();
      img.src = photoImage;
      img.onload = async () => {
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

        faceMesh.onResults((results) =>
          drawEyewearOnPhoto(results, img, selectedProduct)
        );

        await faceMesh.send({ image: img });
      };
    };

    runFaceMesh();
  }, [photoMode, photoImage, selectedProduct]);

  const drawEyewearOnPhoto = (
    results: any,
    image: HTMLImageElement,
    product: Product | null
  ) => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = image.width;
    canvas.height = image.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    const landmarks = results.multiFaceLandmarks?.[0];
    if (!landmarks || !product) {
      toast.error('No face detected in the photo.');
      return;
    }

    const leftEyeOuter = landmarks[33];
    const rightEyeOuter = landmarks[263];

    const eyeDistance = Math.sqrt(
      Math.pow((rightEyeOuter.x - leftEyeOuter.x) * canvas.width, 2) +
        Math.pow((rightEyeOuter.y - leftEyeOuter.y) * canvas.height, 2)
    );

    const centerX =
      ((leftEyeOuter.x + rightEyeOuter.x) / 2) * canvas.width;
    const centerY =
      ((leftEyeOuter.y + rightEyeOuter.y) / 2) * canvas.height;
    const angle = Math.atan2(
      (rightEyeOuter.y - leftEyeOuter.y) * canvas.height,
      (rightEyeOuter.x - leftEyeOuter.x) * canvas.width
    );

    const productImage = productImageRef.current;
    if (!productImage) return;

    const width = eyeDistance * 2;
    const height = width * 0.5;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);
    ctx.drawImage(
      productImage,
      -width / 2,
      -height / 2,
      width,
      height
    );
    ctx.restore();
  };

  // Reset to take another photo
  const resetPhoto = () => {
    setPhotoMode(false);
    setPhotoImage(null);
    setCameraEnabled(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Card className="max-w-4xl w-full">
        <CardContent className="p-6 space-y-6">
          <h1 className="text-2xl font-bold text-center mb-4">
            Virtual Try-On (Photo Mode)
          </h1>

          {!cameraEnabled && !photoMode && (
            <div className="flex flex-col items-center space-y-4">
              <Button onClick={startCamera} disabled={isLoading}>
                <CameraIcon className="mr-2 h-5 w-5" />
                Open Camera
              </Button>

              <div>
                <label
                  htmlFor="photo-upload"
                  className="flex items-center gap-2 cursor-pointer text-primary hover:underline"
                >
                  <Upload className="h-5 w-5" /> Upload a Photo
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {cameraEnabled && !photoMode && (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="rounded-lg w-full aspect-video object-cover scale-x-[-1]"
              />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <Button onClick={capturePhoto}>Capture Photo</Button>
              </div>
            </div>
          )}

          {photoMode && (
            <div className="relative">
              <canvas
                ref={overlayCanvasRef}
                className="rounded-lg w-full aspect-video object-cover"
              />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                <Button variant="secondary" onClick={resetPhoto}>
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Retake / Upload New
                </Button>
              </div>
            </div>
          )}

          {selectedProduct && (
            <div className="flex flex-col items-center space-y-2">
              <h3 className="font-semibold">Selected Frame</h3>
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-32 h-32 object-contain"
              />
              <p className="font-medium">{selectedProduct.name}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TryOnPhotoPage2;
