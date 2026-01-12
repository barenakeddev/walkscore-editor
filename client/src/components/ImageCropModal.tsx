import { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { RotateCw, RotateCcw, ZoomIn, ZoomOut, RotateCcw as Reset, Maximize, Minimize } from "lucide-react";
import { getCroppedImg } from "@/lib/cropImage";
import { toast } from "sonner";

type CropMode = "fill" | "fit";

interface ImageCropModalProps {
  open: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedImageBlob: Blob) => void;
}

export default function ImageCropModal({
  open,
  imageSrc,
  onClose,
  onCropComplete,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [mode, setMode] = useState<CropMode>("fill");

  const onCropChange = useCallback((crop: { x: number; y: number }) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onRotationChange = useCallback((rotation: number) => {
    setRotation(rotation);
  }, []);

  const onCropCompleteCallback = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setMode("fill");
  };

  const handleRotate = (degrees: number) => {
    setRotation((prev) => (prev + degrees) % 360);
  };

  const handleDone = async () => {
    if (!croppedAreaPixels) {
      toast.error("No crop area selected");
      return;
    }

    try {
      const croppedBlob = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation,
        mode
      );
      onCropComplete(croppedBlob);
      onClose();
      toast.success("Image cropped successfully");
    } catch (error) {
      console.error("Error cropping image:", error);
      toast.error("Failed to crop image");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Crop Your Hotel Image</DialogTitle>
        </DialogHeader>

        {/* Cropper Area */}
        <div className="flex-1 relative bg-slate-900 rounded-lg overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={mode === "fill" ? 550 / 280 : undefined}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onRotationChange={onRotationChange}
            onCropComplete={onCropCompleteCallback}
          />
        </div>

        {/* Controls */}
        <div className="space-y-4 py-4">
          {/* Mode Toggle */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Mode</label>
            <ToggleGroup
              type="single"
              value={mode}
              onValueChange={(value) => value && setMode(value as CropMode)}
              className="justify-start"
            >
              <ToggleGroupItem value="fill" aria-label="Fill mode">
                <Maximize className="h-4 w-4 mr-2" />
                Fill
              </ToggleGroupItem>
              <ToggleGroupItem value="fit" aria-label="Fit mode">
                <Minimize className="h-4 w-4 mr-2" />
                Fit
              </ToggleGroupItem>
            </ToggleGroup>
            <p className="text-xs text-slate-500">
              {mode === "fill"
                ? "Crop to fill container (may crop edges)"
                : "Preserve full image with padding"}
            </p>
          </div>

          {/* Zoom Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <ZoomOut className="h-4 w-4" />
                Zoom
                <ZoomIn className="h-4 w-4" />
              </label>
              <span className="text-sm text-slate-500">{zoom.toFixed(1)}x</span>
            </div>
            <Slider
              value={[zoom]}
              onValueChange={(values) => setZoom(values[0])}
              min={1}
              max={3}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Rotation Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Rotation</label>
              <span className="text-sm text-slate-500">{rotation}°</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRotate(-90)}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                -90°
              </Button>
              <Slider
                value={[rotation]}
                onValueChange={(values) => setRotation(values[0])}
                min={0}
                max={360}
                step={1}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRotate(90)}
              >
                <RotateCw className="h-4 w-4 mr-1" />
                +90°
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <Button variant="outline" onClick={handleReset}>
            <Reset className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleDone}>Done</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
