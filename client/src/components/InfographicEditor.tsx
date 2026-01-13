import { Button } from "@/components/ui/button";
import { Download, Upload, Info } from "lucide-react";
import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import ImageCropModal from "@/components/ImageCropModal";
import IconUploader from "@/components/IconUploader";

export default function InfographicEditor() {
  const infographicRef = useRef<HTMLDivElement>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>("");
  const [croppedImageUrl, setCroppedImageUrl] = useState<string>("");
  const [showCropModal, setShowCropModal] = useState(false);
  const [customIcons, setCustomIcons] = useState<{
    foodBeverage?: string;
    location1?: string;
    location2?: string;
    parksMuseums?: string;
    car?: string;
    bus?: string;
    bike?: string;
    walking?: string;
  }>({});

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setOriginalImageUrl(event.target?.result as string);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    const croppedUrl = URL.createObjectURL(croppedBlob);
    setCroppedImageUrl(croppedUrl);
  };

  const handleExport = async () => {
    if (!infographicRef.current) return;

    try {
      toast.info("Generating image...");

      const canvas = await html2canvas(infographicRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => {
          // Process all style elements to remove OKLCH/OKLAB colors
          const styleElements = Array.from(clonedDoc.querySelectorAll('style'));
          styleElements.forEach(styleEl => {
            try {
              // Replace oklch() and oklab() with transparent to avoid parsing errors
              if (styleEl.textContent) {
                styleEl.textContent = styleEl.textContent
                  .replace(/oklch\([^)]+\)/gi, 'transparent')
                  .replace(/oklab\([^)]+\)/gi, 'transparent');
              }
            } catch (e) {
              console.error('Error processing style:', e);
            }
          });

          // Process inline CSSStyleSheet if available
          try {
            Array.from(clonedDoc.styleSheets).forEach((sheet: any) => {
              try {
                const rules = Array.from(sheet.cssRules || sheet.rules || []);
                rules.forEach((rule: any) => {
                  if (rule.style) {
                    // Check each style property for oklch/oklab
                    Array.from(rule.style as unknown as string[]).forEach((prop: string) => {
                      const value = rule.style.getPropertyValue(prop);
                      if (value && (value.includes('oklch') || value.includes('oklab'))) {
                        rule.style.setProperty(prop, 'transparent');
                      }
                    });
                  }
                });
              } catch (e) {
                // Cross-origin or other stylesheet access errors - skip
              }
            });
          } catch (e) {
            console.error('Error processing stylesheets:', e);
          }

          // Process all elements with inline styles containing oklab/oklch
          try {
            const allElements = clonedDoc.querySelectorAll('*');
            allElements.forEach((element: any) => {
              if (element.style) {
                // Check inline styles
                Array.from(element.style).forEach((prop: string) => {
                  const value = element.style.getPropertyValue(prop);
                  if (value && (value.includes('oklch') || value.includes('oklab'))) {
                    element.style.setProperty(prop, 'transparent', 'important');
                  }
                });

                // Also check computed styles and force override if needed
                try {
                  const computed = window.getComputedStyle(element);
                  ['color', 'background-color', 'border-color', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'outline-color'].forEach(prop => {
                    const value = computed.getPropertyValue(prop);
                    if (value && (value.includes('oklch') || value.includes('oklab'))) {
                      element.style.setProperty(prop, 'transparent', 'important');
                    }
                  });
                } catch (e) {
                  // Ignore errors from computed style access
                }
              }

              // Remove CSS variables that might contain oklab/oklch
              if (element.style) {
                Array.from(element.style).forEach((prop: string) => {
                  if (prop.startsWith('--')) {
                    const value = element.style.getPropertyValue(prop);
                    if (value && (value.includes('oklch') || value.includes('oklab'))) {
                      element.style.removeProperty(prop);
                    }
                  }
                });
              }
            });
          } catch (e) {
            console.error('Error processing inline styles:', e);
          }
        },
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.download = "walkscore-infographic.png";
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
          toast.success("Image downloaded successfully!");
        } else {
          toast.error("Failed to create image blob");
        }
      }, "image/png");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error(`Failed to export: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex gap-8 items-start">
          {/* Left Side - Infographic Preview */}
          <div className="flex-shrink-0">
          <div
            ref={infographicRef}
            data-infographic
            className="w-[550px]"
            style={{
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
              backgroundColor: "#ffffff",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
            }}
          >
            {/* Header Section */}
            <div className="p-2.5 text-center" style={{ backgroundColor: "#3d4a5c", color: "#ffffff" }}>
              <h2
                contentEditable
                suppressContentEditableWarning
                className="text-[1.3rem] font-bold mb-1 leading-tight outline-none focus:bg-[#4a5768] px-2 py-1 rounded"
              >
                Courtyard by Marriott Ottawa Downtown
              </h2>
              <div
                contentEditable
                suppressContentEditableWarning
                className="text-[0.8rem] opacity-95 outline-none focus:bg-[#4a5768] px-2 py-1 rounded inline-block"
              >
                350 Dalhousie St, Ottawa, Ontario K1N 8Y3
              </div>
            </div>

            {/* Scores Section */}
            <div className="grid grid-cols-3 gap-2 p-2.5" style={{ backgroundColor: "#3d4a5c" }}>
              <div className="rounded-xl p-2.5 text-center" style={{ backgroundColor: "#5a6a7d" }}>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className="text-5xl font-bold leading-none mb-1 outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded"
                  style={{ color: "#ffffff" }}
                >
                  99
                </div>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className="text-base font-semibold mb-0.5 outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded inline-block"
                  style={{ color: "#ffffff" }}
                >
                  Walk Score
                </div>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className="text-xs outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded inline-block"
                  style={{ color: "rgba(255, 255, 255, 0.85)" }}
                >
                  Walker's Paradise
                </div>
              </div>

              <div className="rounded-xl p-2.5 text-center" style={{ backgroundColor: "#5a6a7d" }}>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className="text-5xl font-bold leading-none mb-1 outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded"
                  style={{ color: "#ffffff" }}
                >
                  91
                </div>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className="text-base font-semibold mb-0.5 outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded inline-block"
                  style={{ color: "#ffffff" }}
                >
                  Transit Score
                </div>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className="text-xs outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded inline-block"
                  style={{ color: "rgba(255, 255, 255, 0.85)" }}
                >
                  Rider's Paradise
                </div>
              </div>

              <div className="rounded-xl p-2.5 text-center" style={{ backgroundColor: "#5a6a7d" }}>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className="text-5xl font-bold leading-none mb-1 outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded"
                  style={{ color: "#ffffff" }}
                >
                  96
                </div>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className="text-base font-semibold mb-0.5 outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded inline-block"
                  style={{ color: "#ffffff" }}
                >
                  Bike Score
                </div>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className="text-xs outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded inline-block"
                  style={{ color: "rgba(255, 255, 255, 0.85)" }}
                >
                  Biker's Paradise
                </div>
              </div>
            </div>

            {/* Hotel Image */}
            <div className="px-3.5 py-4" style={{ backgroundColor: '#f5f5f5' }}>
              <div className="w-full h-[280px] flex items-center justify-center overflow-hidden rounded-2xl" style={{ background: "linear-gradient(to bottom right, #7dd3fc, #38bdf8)" }}>
              {croppedImageUrl ? (
                <img
                  src={croppedImageUrl}
                  alt="Hotel"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center" style={{ color: "#334155" }}>
                  <Upload className="h-10 w-10 mx-auto mb-1.5 opacity-50" />
                  <p className="text-base font-medium">Upload your hotel image</p>
                  <p className="text-[0.65rem] opacity-75 mt-0.5">Click the button above</p>
                </div>
              )}
              </div>
            </div>

            {/* What's Nearby Section */}
            <div className="p-3.5" style={{ backgroundColor: "#f5f5f5" }}>
              <div className="flex items-center justify-center gap-2 text-xl font-bold mb-2.5" style={{ color: "#2d2d2d" }}>
                <span
                  contentEditable
                  suppressContentEditableWarning
                  className="outline-none px-2 py-1 rounded"
                  style={{ backgroundColor: "transparent" }}
                >
                  📍
                </span>
                <span
                  contentEditable
                  suppressContentEditableWarning
                  className="outline-none px-2 py-1 rounded"
                  style={{ backgroundColor: "transparent" }}
                >
                  What's Nearby
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2.5">
                {/* Food & Beverage */}
                <div className="rounded-xl p-2.5 flex items-center gap-2" style={{ backgroundColor: "#5a6a7d" }}>
                  <div className="w-[32px] h-[32px] flex items-center justify-center flex-shrink-0">
                    <IconUploader
                      currentIcon={customIcons.foodBeverage || "/food-beverage-icon.png"}
                      onIconUpload={(dataUrl) => setCustomIcons({...customIcons, foodBeverage: dataUrl})}
                      alt="Food & Beverage"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="text-sm font-semibold outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded inline-block"
                      style={{ color: "#ffffff" }}
                    >
                      Food & Beverage
                    </div>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="text-lg font-bold outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded block mt-0.5"
                      style={{ color: "#ffffff" }}
                    >
                      0.03 km
                    </div>
                  </div>
                </div>

                {/* Rogers Centre */}
                <div className="rounded-xl p-2.5 flex items-center gap-2" style={{ backgroundColor: "#5a6a7d" }}>
                  <div className="w-[32px] h-[32px] flex items-center justify-center flex-shrink-0">
                    <IconUploader
                      currentIcon={customIcons.location1 || "/rogers-centre-logo.png"}
                      onIconUpload={(dataUrl) => setCustomIcons({...customIcons, location1: dataUrl})}
                      alt="Rogers Centre"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="text-sm font-semibold outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded inline-block"
                      style={{ color: "#ffffff" }}
                    >
                      Rogers Centre
                    </div>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="text-lg font-bold outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded block mt-0.5"
                      style={{ color: "#ffffff" }}
                    >
                      0.01 km
                    </div>
                  </div>
                </div>

                {/* Rideau Centre */}
                <div className="rounded-xl p-2.5 flex items-center gap-2" style={{ backgroundColor: "#5a6a7d" }}>
                  <div className="w-[32px] h-[32px] flex items-center justify-center flex-shrink-0">
                    <IconUploader
                      currentIcon={customIcons.location2 || "/rideau-centre-icon.png"}
                      onIconUpload={(dataUrl) => setCustomIcons({...customIcons, location2: dataUrl})}
                      alt="Rideau Centre"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="text-sm font-semibold outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded inline-block"
                      style={{ color: "#ffffff" }}
                    >
                      Rideau Centre
                    </div>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="text-lg font-bold outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded block mt-0.5"
                      style={{ color: "#ffffff" }}
                    >
                      0.6 km
                    </div>
                  </div>
                </div>

                {/* Parks & Museums */}
                <div className="rounded-xl p-2.5 flex items-center gap-2" style={{ backgroundColor: "#5a6a7d" }}>
                  <div className="w-[32px] h-[32px] flex items-center justify-center flex-shrink-0">
                    <IconUploader
                      currentIcon={customIcons.parksMuseums || "/parks-museums-icon.png"}
                      onIconUpload={(dataUrl) => setCustomIcons({...customIcons, parksMuseums: dataUrl})}
                      alt="Parks & Museums"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="text-sm font-semibold outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded inline-block"
                      style={{ color: "#ffffff" }}
                    >
                      Parks & Museums
                    </div>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="text-lg font-bold outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded block mt-0.5"
                      style={{ color: "#ffffff" }}
                    >
                      0.7 km
                    </div>
                  </div>
                </div>
              </div>

              {/* Commute Section */}
              <div className="rounded-xl p-2.5" style={{ backgroundColor: "#5a6a7d" }}>
                <div className="text-center mb-2">
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className="text-base font-bold outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded inline-block"
                    style={{ color: "#ffffff" }}
                  >
                    Parliament Hill
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  <div className="flex items-center gap-0.5">
                    <div className="w-[32px] h-[32px] flex items-center justify-center flex-shrink-0">
                      <IconUploader
                        currentIcon={customIcons.car || "/car-icon.png"}
                        onIconUpload={(dataUrl) => setCustomIcons({...customIcons, car: dataUrl})}
                        alt="Car"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="text-sm font-bold outline-none focus:bg-[#6a7a8d] px-1.5 py-0.5 rounded inline-block"
                      style={{ color: "#ffffff" }}
                    >
                      4 min
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <div className="w-[32px] h-[32px] flex items-center justify-center flex-shrink-0">
                      <IconUploader
                        currentIcon={customIcons.bus || "/bus-icon.png"}
                        onIconUpload={(dataUrl) => setCustomIcons({...customIcons, bus: dataUrl})}
                        alt="Bus"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="text-sm font-bold outline-none focus:bg-[#6a7a8d] px-1.5 py-0.5 rounded inline-block"
                      style={{ color: "#ffffff" }}
                    >
                      10 min
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <div className="w-[32px] h-[32px] flex items-center justify-center flex-shrink-0">
                      <IconUploader
                        currentIcon={customIcons.bike || "/bike-icon.png"}
                        onIconUpload={(dataUrl) => setCustomIcons({...customIcons, bike: dataUrl})}
                        alt="Bike"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="text-sm font-bold outline-none focus:bg-[#6a7a8d] px-1.5 py-0.5 rounded inline-block"
                      style={{ color: "#ffffff" }}
                    >
                      5 min
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <div className="w-[32px] h-[32px] flex items-center justify-center flex-shrink-0">
                      <IconUploader
                        currentIcon={customIcons.walking || "/walking-icon.png"}
                        onIconUpload={(dataUrl) => setCustomIcons({...customIcons, walking: dataUrl})}
                        alt="Walking"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="text-sm font-bold outline-none focus:bg-[#6a7a8d] px-1.5 py-0.5 rounded inline-block"
                      style={{ color: "#ffffff" }}
                    >
                      11 min
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>

          {/* Right Side - Controls */}
          <div className="flex-1 space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Walk Score Infographic Editor
              </h1>
              <p className="text-slate-600 text-sm">
                Click on any text to edit. Upload your hotel image and export when ready.
              </p>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <label htmlFor="image-upload" className="block">
                <Button variant="outline" className="w-full cursor-pointer" size="lg" asChild>
                  <span>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Hotel Image
                  </span>
                </Button>
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <Button onClick={handleExport} size="lg" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Export as PNG
              </Button>
            </div>

            {/* Info Box */}
            <div className="flex items-start gap-2 text-sm text-slate-500 bg-blue-50 px-4 py-3 rounded-lg">
              <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>Click any text or emoji to edit it directly</span>
            </div>

            {/* Pro Tip */}
            <div className="text-slate-600 bg-slate-50 px-4 py-3 rounded-lg">
              <p className="text-sm">
                💡 <strong>Pro tip:</strong> After editing, click "Export as PNG" to download your infographic.
                The image will be optimized for social media sharing at 1960×1544 pixels (2x resolution).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Image Crop Modal */}
      <ImageCropModal
        open={showCropModal}
        imageSrc={originalImageUrl}
        onClose={() => setShowCropModal(false)}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
