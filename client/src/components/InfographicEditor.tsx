import { Button } from "@/components/ui/button";
import { Download, Upload, Info } from "lucide-react";
import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { toast } from "sonner";

export default function InfographicEditor() {
  const infographicRef = useRef<HTMLDivElement>(null);
  const [imageUrl, setImageUrl] = useState<string>("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
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
          // Process all style elements to remove OKLCH colors
          const styleElements = Array.from(clonedDoc.querySelectorAll('style'));
          styleElements.forEach(styleEl => {
            try {
              // Replace oklch() with transparent to avoid parsing errors
              if (styleEl.textContent) {
                styleEl.textContent = styleEl.textContent.replace(/oklch\([^)]+\)/gi, 'transparent');
              }
            } catch (e) {
              console.error('Error processing style:', e);
            }
          });

          // Also process inline CSSStyleSheet if available
          try {
            Array.from(clonedDoc.styleSheets).forEach((sheet: any) => {
              try {
                const rules = Array.from(sheet.cssRules || sheet.rules || []);
                rules.forEach((rule: any) => {
                  if (rule.style) {
                    // Check each style property for oklch
                    Array.from(rule.style).forEach((prop: string) => {
                      const value = rule.style.getPropertyValue(prop);
                      if (value && value.includes('oklch')) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Walk Score Infographic Editor
          </h1>
          <p className="text-slate-600 text-lg mb-6">
            Click on any text to edit. Upload your hotel image and export when ready.
          </p>
          
          <div className="flex gap-4 justify-center items-center flex-wrap">
            <label htmlFor="image-upload">
              <Button variant="outline" className="cursor-pointer" asChild>
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
            
            <Button onClick={handleExport} size="lg">
              <Download className="mr-2 h-4 w-4" />
              Export as PNG
            </Button>
          </div>

          <div className="mt-4 inline-flex items-center gap-2 text-sm text-slate-500 bg-blue-50 px-4 py-2 rounded-lg">
            <Info className="h-4 w-4" />
            <span>Click any text or emoji to edit it directly</span>
          </div>
        </div>

        {/* Infographic */}
        <div className="flex justify-center">
          <div
            ref={infographicRef}
            data-infographic
            className="w-[980px]"
            style={{
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
              backgroundColor: "#ffffff",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
            }}
          >
            {/* Header Section */}
            <div className="p-6 text-center" style={{ backgroundColor: "#3d4a5c", color: "#ffffff" }}>
              <h2
                contentEditable
                suppressContentEditableWarning
                className="text-[2.75rem] font-bold mb-4 leading-tight outline-none focus:bg-[#4a5768] px-2 py-1 rounded"
              >
                Courtyard by Marriott Ottawa Downtown
              </h2>
              <div
                contentEditable
                suppressContentEditableWarning
                className="text-[1.65rem] opacity-95 outline-none focus:bg-[#4a5768] px-2 py-1 rounded inline-block"
              >
                350 Dalhousie St, Ottawa, Ontario K1N 8Y3
              </div>
            </div>

            {/* Scores Section */}
            <div className="grid grid-cols-3 gap-5 p-6" style={{ backgroundColor: "#3d4a5c" }}>
              <div className="rounded-xl p-6 text-center" style={{ backgroundColor: "#5a6a7d" }}>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className="text-8xl font-bold leading-none mb-4 outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded"
                  style={{ color: "#ffffff" }}
                >
                  99
                </div>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className="text-2xl font-semibold mb-2 outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded inline-block"
                  style={{ color: "#ffffff" }}
                >
                  Walk Score
                </div>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className="text-lg outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded inline-block"
                  style={{ color: "rgba(255, 255, 255, 0.85)" }}
                >
                  Walker's Paradise
                </div>
              </div>

              <div className="rounded-xl p-6 text-center" style={{ backgroundColor: "#5a6a7d" }}>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className="text-8xl font-bold leading-none mb-4 outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded"
                  style={{ color: "#ffffff" }}
                >
                  91
                </div>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className="text-2xl font-semibold mb-2 outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded inline-block"
                  style={{ color: "#ffffff" }}
                >
                  Transit Score
                </div>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className="text-lg outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded inline-block"
                  style={{ color: "rgba(255, 255, 255, 0.85)" }}
                >
                  Rider's Paradise
                </div>
              </div>

              <div className="rounded-xl p-6 text-center" style={{ backgroundColor: "#5a6a7d" }}>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className="text-8xl font-bold leading-none mb-4 outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded"
                  style={{ color: "#ffffff" }}
                >
                  96
                </div>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className="text-2xl font-semibold mb-2 outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded inline-block"
                  style={{ color: "#ffffff" }}
                >
                  Bike Score
                </div>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className="text-lg outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded inline-block"
                  style={{ color: "rgba(255, 255, 255, 0.85)" }}
                >
                  Biker's Paradise
                </div>
              </div>
            </div>

            {/* Hotel Image */}
            <div className="px-10 py-8" style={{ backgroundColor: '#f5f5f5' }}>
              <div className="w-full h-[360px] flex items-center justify-center overflow-hidden rounded-2xl" style={{ background: "linear-gradient(to bottom right, #7dd3fc, #38bdf8)" }}>
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Hotel"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center" style={{ color: "#334155" }}>
                  <Upload className="h-16 w-16 mx-auto mb-3 opacity-50" />
                  <p className="text-xl font-medium">Upload your hotel image</p>
                  <p className="text-sm opacity-75 mt-1">Click the button above</p>
                </div>
              )}
              </div>
            </div>

            {/* What's Nearby Section */}
            <div className="p-10" style={{ backgroundColor: "#f5f5f5" }}>
              <div className="flex items-center justify-center gap-4 text-4xl font-bold mb-8" style={{ color: "#2d2d2d" }}>
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

              <div className="grid grid-cols-2 gap-5 mb-8">
                {/* Food & Beverage */}
                <div className="rounded-xl p-8 flex items-center gap-5" style={{ backgroundColor: "#5a6a7d" }}>
                  <div className="w-[60px] h-[60px] flex items-center justify-center flex-shrink-0">
                    <img src="/food-beverage-icon.png" alt="Food & Beverage" className="w-full h-full object-contain rounded-lg" />
                  </div>
                  <div className="flex-1">
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="text-2xl font-semibold outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded inline-block"
                      style={{ color: "#ffffff" }}
                    >
                      Food & Beverage
                    </div>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="text-3xl font-bold outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded block mt-1"
                      style={{ color: "#ffffff" }}
                    >
                      0.03 km
                    </div>
                  </div>
                </div>

                {/* Rogers Centre */}
                <div className="rounded-xl p-8 flex items-center gap-5" style={{ backgroundColor: "#5a6a7d" }}>
                  <div className="w-[60px] h-[60px] flex items-center justify-center flex-shrink-0">
                    <img src="/rogers-centre-logo.png" alt="Rogers Centre" className="w-full h-full object-contain rounded-lg" />
                  </div>
                  <div className="flex-1">
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="text-2xl font-semibold outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded inline-block"
                      style={{ color: "#ffffff" }}
                    >
                      Rogers Centre
                    </div>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="text-3xl font-bold outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded block mt-1"
                      style={{ color: "#ffffff" }}
                    >
                      0.01 km
                    </div>
                  </div>
                </div>

                {/* Rideau Centre */}
                <div className="rounded-xl p-8 flex items-center gap-5" style={{ backgroundColor: "#5a6a7d" }}>
                  <div className="w-[60px] h-[60px] flex items-center justify-center flex-shrink-0">
                    <img src="/rideau-centre-icon.png" alt="Rideau Centre" className="w-full h-full object-contain rounded-lg" />
                  </div>
                  <div className="flex-1">
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="text-2xl font-semibold outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded inline-block"
                      style={{ color: "#ffffff" }}
                    >
                      Rideau Centre
                    </div>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="text-3xl font-bold outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded block mt-1"
                      style={{ color: "#ffffff" }}
                    >
                      0.6 km
                    </div>
                  </div>
                </div>

                {/* Parks & Museums */}
                <div className="rounded-xl p-8 flex items-center gap-5" style={{ backgroundColor: "#5a6a7d" }}>
                  <div className="w-[60px] h-[60px] flex items-center justify-center flex-shrink-0">
                    <img src="/parks-museums-icon.png" alt="Parks & Museums" className="w-full h-full object-contain rounded-lg" />
                  </div>
                  <div className="flex-1">
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="text-2xl font-semibold outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded inline-block"
                      style={{ color: "#ffffff" }}
                    >
                      Parks & Museums
                    </div>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="text-3xl font-bold outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded block mt-1"
                      style={{ color: "#ffffff" }}
                    >
                      0.7 km
                    </div>
                  </div>
                </div>
              </div>

              {/* Commute Section */}
              <div className="rounded-xl p-9" style={{ backgroundColor: "#5a6a7d" }}>
                <div className="text-center mb-8">
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className="text-3xl font-bold outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded inline-block"
                    style={{ color: "#ffffff" }}
                  >
                    Parliament Hill
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-8">
                  <div className="flex items-center gap-1">
                    <div className="w-[60px] h-[60px] flex items-center justify-center flex-shrink-0">
                      <img src="/car-icon.png" alt="Car" className="w-full h-full object-contain" />
                    </div>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="text-2xl font-bold outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded inline-block"
                      style={{ color: "#ffffff" }}
                    >
                      4 min
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-[60px] h-[60px] flex items-center justify-center flex-shrink-0">
                      <img src="/bus-icon.png" alt="Bus" className="w-full h-full object-contain" />
                    </div>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="text-2xl font-bold outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded inline-block"
                      style={{ color: "#ffffff" }}
                    >
                      10 min
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-[60px] h-[60px] flex items-center justify-center flex-shrink-0">
                      <img src="/bike-icon.png" alt="Bike" className="w-full h-full object-contain" />
                    </div>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="text-2xl font-bold outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded inline-block"
                      style={{ color: "#ffffff" }}
                    >
                      5 min
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-[60px] h-[60px] flex items-center justify-center flex-shrink-0">
                      <img src="/walking-icon.png" alt="Walking" className="w-full h-full object-contain" />
                    </div>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="text-2xl font-bold outline-none focus:bg-[#6a7a8d] px-2 py-1 rounded inline-block"
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

        {/* Footer Instructions */}
        <div className="mt-8 text-center text-slate-600 max-w-2xl mx-auto">
          <p className="text-sm">
            💡 <strong>Pro tip:</strong> After editing, click "Export as PNG" to download your infographic. 
            The image will be optimized for social media sharing at 1960×1544 pixels (2x resolution).
          </p>
        </div>
      </div>
    </div>
  );
}
