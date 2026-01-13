import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";

interface IconUploaderProps {
  currentIcon: string;
  onIconUpload: (dataUrl: string) => void;
  alt: string;
  className?: string;
}

export default function IconUploader({
  currentIcon,
  onIconUpload,
  alt,
  className = "",
}: IconUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Optional: Validate file size (e.g., max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("Image file is too large (max 5MB)");
      return;
    }

    // Read file and convert to data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onIconUpload(dataUrl);
        toast.success("Icon updated!");
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read image file");
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be selected again
    e.target.value = "";
  };

  return (
    <div
      className="relative w-full h-full group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Icon Image */}
      <img src={currentIcon} alt={alt} className={className} />

      {/* Hover Overlay */}
      <div
        className={`absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center transition-opacity duration-200 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex flex-col items-center gap-1">
          <Camera className="w-5 h-5 text-white" />
          <span className="text-xs text-white font-medium">Upload</span>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
