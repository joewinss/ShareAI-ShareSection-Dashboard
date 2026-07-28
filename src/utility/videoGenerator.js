export const createVideoFromImages = async (imageFiles, durationPerImage = 2000) => {
    if (!imageFiles || imageFiles.length === 0) return null;

    // Load all images first to get dimensions and ensure they are valid
    const loadedImages = await Promise.all(
        imageFiles.map((file) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.crossOrigin = "anonymous"; // Important if using proxy urls converted to object urls? Not really for blobs
                img.src = URL.createObjectURL(file);
            });
        })
    );

    if (loadedImages.length === 0) return null;

    // Use dimensions of the first image for the canvas
    const width = loadedImages[0].width;
    const height = loadedImages[0].height;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Determine supported mime type
    const getSupportedMimeType = () => {
        const types = [
            'video/mp4',
            'video/webm;codecs=vp9',
            'video/webm;codecs=vp8',
            'video/webm'
        ];
        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }
        return '';
    };

    const mimeType = getSupportedMimeType();
    if (!mimeType) {
        console.error("No supported MediaRecorder mime type found.");
        return null; // Or handle graceful failure
    }

    const stream = canvas.captureStream(30); // 30 FPS
    const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType
    });

    const chunks = [];
    mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
    };

    return new Promise((resolve, reject) => {
        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: mimeType });
            // Extension based on mime type
            const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
            const videoFile = new File([blob], `slideshow.${ext}`, { type: mimeType });

            // Clean up object URLs
            loadedImages.forEach(img => URL.revokeObjectURL(img.src));

            resolve(videoFile);
        };

        mediaRecorder.onerror = (e) => {
            console.error("MediaRecorder error:", e);
            reject(e);
        };

        mediaRecorder.start();

        // Animation logic
        const startTime = Date.now();
        const totalImages = loadedImages.length;
        const totalDuration = totalImages * durationPerImage;
        let animationFrameId;

        const draw = () => {
            const currentTime = Date.now() - startTime;

            if (currentTime >= totalDuration) {
                // Final frame has been displayed, stop recording
                // Allow a small buffer for the last frame to be captured
                setTimeout(() => {
                    if (mediaRecorder.state !== 'inactive') {
                        mediaRecorder.stop();
                    }
                    cancelAnimationFrame(animationFrameId);
                }, 100);
                return;
            }

            const imageIndex = Math.min(Math.floor(currentTime / durationPerImage), totalImages - 1);
            const img = loadedImages[imageIndex];

            // Clear
            ctx.fillStyle = '#000'; // Black background
            ctx.fillRect(0, 0, width, height);

            // Draw image (Center and Contain)
            const scale = Math.min(width / img.width, height / img.height);
            const w = img.width * scale;
            const h = img.height * scale;
            const x = (width / 2) - (w / 2);
            const y = (height / 2) - (h / 2);

            ctx.drawImage(img, x, y, w, h);

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();
    });
};