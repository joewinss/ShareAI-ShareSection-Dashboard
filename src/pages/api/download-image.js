// API endpoint for downloading images through proxy to avoid CORS issues
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { imageUrl, filename } = req.query;

        if (!imageUrl) {
            return res.status(400).json({ error: 'imageUrl parameter is required' });
        }

        // console.log('Proxying download for:', imageUrl);

        // Fetch the image from S3 (server-side, no CORS issues)
        const response = await fetch(imageUrl);

        if (!response.ok) {
            console.error(`Failed to fetch image: ${response.status} ${response.statusText}`);
            return res.status(response.status).json({
                error: `Failed to fetch image: ${response.status} ${response.statusText}`
            });
        }

        // Get the image buffer
        const buffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(buffer);

        // Determine content type from the response or URL
        const contentType = response.headers.get('content-type') || 'image/jpeg';

        // Determine filename
        const defaultExtension = contentType.includes('png') ? 'png' : 'jpg';
        const finalFilename = filename || `image.${defaultExtension}`;

        // Set headers to force download
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${finalFilename}"`);
        res.setHeader('Content-Length', uint8Array.length);
        res.setHeader('Cache-Control', 'no-cache');

        // Send the image buffer
        res.send(Buffer.from(uint8Array));

    } catch (error) {
        console.error('Error in download-image API:', error);
        res.status(500).json({
            error: 'Failed to download image',
            details: error.message
        });
    }
}
