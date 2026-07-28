import { Readable } from 'stream';

export const config = {
  api: {
    responseLimit: false,
  },
};

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
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  webm: 'video/webm',
  m4v: 'video/mp4',
};

const videoExtensions = new Set(['mp4', 'mov', 'webm', 'm4v']);

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) {
    res.status(400).json({ error: 'Missing image URL' });
    return;
  }

  try {
    const upstream = await fetch(url);
    if (!upstream.ok) {
      res.status(upstream.status).json({ error: 'Failed to fetch image' });
      return;
    }

    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1].split('?')[0] || 'image.jpg';
    const fileExtension = fileName.split('.').pop().toLowerCase();

    let contentType = upstream.headers.get('content-type');
    if (mimeTypes[fileExtension]) {
      contentType = mimeTypes[fileExtension];
    } else if (!contentType || contentType === 'application/octet-stream') {
      contentType = videoExtensions.has(fileExtension) ? 'video/mp4' : 'image/jpeg';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);

    const contentLength = upstream.headers.get('content-length');
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    if (!upstream.body) {
      res.status(500).json({ error: 'Empty response body' });
      return;
    }

    const nodeStream = Readable.fromWeb(upstream.body);
    nodeStream.on('error', (streamErr) => {
      if (!res.headersSent) {
        res.status(500).json({ error: 'Stream error', details: streamErr.message });
        return;
      }
      res.destroy(streamErr);
    });
    nodeStream.pipe(res);
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: 'Proxy error', details: err.message });
    } else {
      res.destroy(err);
    }
  }
}
