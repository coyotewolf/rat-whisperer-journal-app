
import { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RotateCw, ZoomIn, ZoomOut, ArrowLeft } from "lucide-react";

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string) => void;
}

const ImageCropModal = ({ isOpen, onClose, imageUrl, onCropComplete }: ImageCropModalProps) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleCrop = useCallback(async () => {
    if (!imageUrl || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to 300x300 for profile pictures
    canvas.width = 300;
    canvas.height = 300;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // Apply transformations
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.translate(position.x, position.y);

    // Draw the image centered
    const img = imageRef.current;
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();

    // Convert canvas to data URL
    const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
    onCropComplete(croppedImageUrl);
  }, [imageUrl, scale, rotation, position, onCropComplete]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-xl bg-gradient-to-br from-indigo-900/90 via-purple-900/90 to-pink-800/90 backdrop-blur-md border-white/20">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-lg bg-white/10 hover:bg-white/20 p-2 text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DialogTitle className="flex-1 text-center text-white">Crop Profile Picture</DialogTitle>
            <div className="w-8"></div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Image preview area */}
          <div className="relative w-full h-64 border-2 border-dashed border-white/20 rounded-lg overflow-hidden bg-white/10">
            {imageUrl && (
              <>
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="Crop preview"
                  className="absolute inset-0 w-full h-full object-contain cursor-move"
                  style={{
                    transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  draggable={false}
                />
                <canvas ref={canvasRef} className="hidden" />
              </>
            )}
          </div>

          {/* Controls */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ZoomOut className="h-4 w-4 text-white" />
              <Slider
                value={[scale]}
                onValueChange={(value) => setScale(value[0])}
                min={0.5}
                max={3}
                step={0.1}
                className="flex-1"
              />
              <ZoomIn className="h-4 w-4 text-white" />
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRotation(prev => prev - 90)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <RotateCw className="h-4 w-4 rotate-180" />
              </Button>
              <span className="text-sm text-gray-300 flex-1 text-center">
                Rotation: {rotation}°
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRotation(prev => prev + 90)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            Cancel
          </Button>
          <Button onClick={handleCrop} className="bg-orange-500 hover:bg-orange-600">
            Apply Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropModal;
