import { Area } from "react-easy-crop";

type CropMode = "fill" | "fit";

const CONTAINER_WIDTH = 550;
const CONTAINER_HEIGHT = 280;

/**
 * Creates a cropped image from the source image with applied rotation
 * @param imageSrc - The source image URL (data URL or blob URL)
 * @param pixelCrop - The crop area in pixels from react-easy-crop
 * @param rotation - Rotation angle in degrees (default: 0)
 * @param mode - Crop mode: "fill" crops to container size, "fit" adds letterboxing (default: "fill")
 * @returns Promise<Blob> - The cropped image as a blob
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  mode: CropMode = "fill"
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get 2D context");
  }

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  // Set canvas size to accommodate rotation
  canvas.width = safeArea;
  canvas.height = safeArea;

  // Translate canvas context to center
  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  // Draw rotated image
  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  // Set canvas size to final crop size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw the cropped area
  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );

  // If in fit mode, add letterboxing to fit within container dimensions
  if (mode === "fit") {
    return addLetterboxing(canvas);
  }

  // Convert canvas to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Canvas is empty"));
      }
    }, "image/png");
  });
}

/**
 * Adds letterboxing to fit the cropped image within the container dimensions
 * @param sourceCanvas - The cropped image canvas
 * @returns Promise<Blob> - The letterboxed image as a blob
 */
function addLetterboxing(sourceCanvas: HTMLCanvasElement): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get 2D context");
  }

  // Set canvas to container dimensions
  canvas.width = CONTAINER_WIDTH;
  canvas.height = CONTAINER_HEIGHT;

  // Fill with white background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Calculate scale to fit within container while preserving aspect ratio
  const scale = Math.min(
    CONTAINER_WIDTH / sourceCanvas.width,
    CONTAINER_HEIGHT / sourceCanvas.height
  );

  const scaledWidth = sourceCanvas.width * scale;
  const scaledHeight = sourceCanvas.height * scale;

  // Center the image
  const x = (CONTAINER_WIDTH - scaledWidth) / 2;
  const y = (CONTAINER_HEIGHT - scaledHeight) / 2;

  // Draw the cropped image centered with letterboxing
  ctx.drawImage(sourceCanvas, x, y, scaledWidth, scaledHeight);

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Canvas is empty"));
      }
    }, "image/png");
  });
}

/**
 * Helper function to create an image element from a source URL
 * @param url - The image URL
 * @returns Promise<HTMLImageElement>
 */
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}
