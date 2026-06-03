const ImageKit = require('imagekit');
const axios = require('axios');

let _imagekit = null;

function getClient() {
  if (!_imagekit) {
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

    if (!publicKey || !privateKey || !urlEndpoint) {
      throw new Error('ImageKit credentials not fully configured');
    }

    _imagekit = new ImageKit({ publicKey, privateKey, urlEndpoint });
  }
  return _imagekit;
}

/**
 * Download a binary buffer from a URL and upload it to ImageKit.
 * @param {string} mediaUrl  - Source URL (e.g. WhatsApp media URL after Bearer-auth download)
 * @param {string} filename  - Destination filename in ImageKit (e.g. "user_919876543210_profile.jpg")
 * @param {Buffer} [buffer]  - If already downloaded, pass the buffer directly
 * @returns {Promise<string>} - Public ImageKit URL of the uploaded file
 */
async function uploadFromUrl(mediaUrl, filename, buffer) {
  const imagekit = getClient();

  let fileBuffer = buffer;

  if (!fileBuffer) {
    // Download the binary from the URL
    const response = await axios.get(mediaUrl, {
      responseType: 'arraybuffer',
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      },
    });
    fileBuffer = Buffer.from(response.data);
  }

  // Convert to base64 for ImageKit upload
  const base64Data = fileBuffer.toString('base64');

  return new Promise((resolve, reject) => {
    imagekit.upload(
      {
        file: base64Data,
        fileName: filename,
        folder: '/whatchat/profiles',
        useUniqueFileName: false,
        tags: ['whatchat', 'profile'],
      },
      (err, result) => {
        if (err) {
          console.error('[ImageKit] Upload error:', err);
          return reject(new Error(`ImageKit upload failed: ${err.message || JSON.stringify(err)}`));
        }
        console.log(`[ImageKit] Uploaded: ${result.url}`);
        resolve(result.url);
      }
    );
  });
}

module.exports = { uploadFromUrl };
