import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';
import sharp from 'sharp';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;

  const siteId = process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_TOKEN;

  if (!siteId || !token) {
    return new NextResponse('Image storage not configured', { status: 500 });
  }

  try {
    const store = getStore({
      name: 'blog-images',
      siteID: siteId,
      token,
    });

    const blob = await store.get(key, { type: 'arrayBuffer' });

    if (!blob) {
      return new NextResponse('Image not found', { status: 404 });
    }

    // Check if client accepts WebP
    const acceptHeader = request.headers.get('accept') || '';
    const acceptsWebP = acceptHeader.includes('image/webp');

    // Compress and optionally convert to WebP
    const input = Buffer.from(blob);
    let output: Buffer;
    let contentType: string;

    if (acceptsWebP) {
      output = await sharp(input)
        .webp({ quality: 75 })
        .toBuffer();
      contentType = 'image/webp';
    } else {
      // Compress JPEG in place
      const meta = await sharp(input).metadata();
      if (meta.format === 'jpeg' || meta.format === 'jpg') {
        output = await sharp(input).jpeg({ quality: 75, mozjpeg: true }).toBuffer();
        contentType = 'image/jpeg';
      } else if (meta.format === 'png') {
        output = await sharp(input).png({ compressionLevel: 9 }).toBuffer();
        contentType = 'image/png';
      } else {
        output = input;
        contentType = 'image/webp';
      }
    }

    return new NextResponse(new Uint8Array(output), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Vary': 'Accept',
      },
    });
  } catch {
    return new NextResponse('Image not found', { status: 404 });
  }
}
