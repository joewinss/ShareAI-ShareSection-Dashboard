export default async function handler(req, res) {
    const { url } = req.query;
    if (!url) {
        res.status(400).json({ error: 'Missing image URL' });
        return;
    }

    // Mapping of file extensions to MIME types
    const mimeTypes = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
        svg: 'image/svg+xml',
        bmp: 'image/bmp',
        tiff: 'image/tiff',
        ico: 'image/x-icon',
    };

    try {
        const response = await fetch(url);
        if (!response.ok) {
            res.status(response.status).json({ error: 'Failed to fetch image' });
            return;
        }

        // Extract file extension from URL
        const urlParts = url.split('/');
        const fileName = urlParts[urlParts.length - 1].split('?')[0] || 'image.jpg';
        const fileExtension = fileName.split('.').pop().toLowerCase();

        // Get the content type from the response headers
        let contentType = response.headers.get('content-type');

        // Always prefer file extension-based MIME type for images to ensure correct type
        // This fixes issues where S3 returns application/octet-stream
        if (mimeTypes[fileExtension]) {
            contentType = mimeTypes[fileExtension];
        } else if (!contentType || contentType === 'application/octet-stream') {
            // If no extension match and no valid content-type, default to jpeg
            contentType = 'image/jpeg';
        }

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);

        const buffer = await response.arrayBuffer();
        if (!buffer || buffer.byteLength === 0) {
            res.status(500).json({ error: 'Image buffer is empty' });
            return;
        }

        res.send(Buffer.from(buffer));
    } catch (err) {
        res.status(500).json({ error: 'Proxy error', details: err.message });
    }
}
