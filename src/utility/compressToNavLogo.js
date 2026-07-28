/**
 * Compress any image File to the Website Nav Logo preset:
 * 200x200 canvas, 44 px inner bound, transparent background, PNG.
 *
 * @param {File} file - source image file
 * @returns {Promise<File>} compressed PNG File named "compressed_logo.png"
 */
export async function compressToNavLogo(file) {
  const CANVAS_SIZE = 200;
  const INNER_BOUND = 44;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = CANVAS_SIZE;
        canvas.height = CANVAS_SIZE;

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        const originalRatio = img.width / img.height;
        let finalW;
        let finalH;

        if (originalRatio > 1) {
          finalW = Math.min(INNER_BOUND, CANVAS_SIZE);
          finalH = finalW / originalRatio;
        } else {
          finalH = Math.min(INNER_BOUND, CANVAS_SIZE);
          finalW = finalH * originalRatio;
        }

        const xOffset = (CANVAS_SIZE - finalW) / 2;
        const yOffset = (CANVAS_SIZE - finalH) / 2;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, xOffset, yOffset, finalW, finalH);

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Canvas toBlob returned null"));
            return;
          }

          resolve(
            new File([blob], "compressed_logo.png", { type: "image/png" })
          );
        }, "image/png");
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = event.target.result;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
