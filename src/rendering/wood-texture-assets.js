const TEXTURE_URLS = Object.freeze({
  'american-hard-maple-end-grain': './assets/wood/american-hard-maple-end-grain.jpg',
  'american-black-walnut-end-grain': './assets/wood/american-black-walnut-end-grain.jpg',
  'american-black-cherry-end-grain': './assets/wood/american-black-cherry-end-grain.jpg',
});

const textureImages = new Map();

function loadImage(textureKey, source) {
  return new Promise((resolve) => {
    if (typeof Image === 'undefined') {
      resolve(null);
      return;
    }
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      textureImages.set(textureKey, image);
      resolve(image);
    };
    image.onerror = () => resolve(null);
    image.src = source;
  });
}

export async function loadWoodTextureAssets() {
  await Promise.all(Object.entries(TEXTURE_URLS).map(([key, source]) => loadImage(key, source)));
}

export function getWoodTextureImage(textureKey) {
  return textureImages.get(textureKey) ?? null;
}

export function getWoodTextureUrl(textureKey) {
  return TEXTURE_URLS[textureKey] ?? null;
}
