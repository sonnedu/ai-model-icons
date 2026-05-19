export const assetProfiles = (item, origin = "") => {
  const icon = `/${item.icon.path}`;
  const encodedName = encodeURIComponent(item.name);
  const rasterBase = `/assets/raster/${item.id}`;

  return {
    id: item.id,
    name: item.name,
    ownerId: item.ownerId || null,
    source: item.icon.source,
    match: item.icon.match || null,
    svg: icon,
    apple: {
      xcodeImageSet: `/assets/apple/${item.id}.imageset/Contents.json`,
      universalSvg: icon,
      appleTouchIconSvg: icon,
      appleTouchIconPng: `${rasterBase}/apple-touch-icon-180.png`,
      icon1024Png: `${rasterBase}/icon-1024.png`
    },
    android: {
      adaptiveIconXml: `/assets/android/${item.id}/mipmap-anydpi-v26/ic_launcher.xml`,
      foregroundVectorDrawable: `/assets/android/${item.id}/drawable/ic_launcher_foreground.xml`,
      monochromeVectorDrawable: `/assets/android/${item.id}/drawable/ic_launcher_monochrome.xml`,
      chrome192Png: `${rasterBase}/android-chrome-192.png`,
      chrome512Png: `${rasterBase}/android-chrome-512.png`,
      webManifest: `/manifest/${encodeURIComponent(item.id)}.webmanifest`,
      svg: icon,
      note: "Android VectorDrawable is not equivalent to arbitrary SVG. The XML endpoints provide a wrapper/reference profile; convert complex SVG paths with Android Studio Vector Asset, vector-drawable-tool, or a build step when native APK resources are required."
    },
    web: {
      faviconSvg: icon,
      favicon16Png: `${rasterBase}/favicon-16.png`,
      favicon32Png: `${rasterBase}/favicon-32.png`,
      favicon48Png: `${rasterBase}/favicon-48.png`,
      maskIcon: icon,
      webManifest: `/manifest/${encodeURIComponent(item.id)}.webmanifest`
    },
    html: {
      favicon: `<link rel="icon" type="image/svg+xml" href="${icon}">`,
      appleTouchIcon: `<link rel="apple-touch-icon" href="${icon}">`,
      maskIcon: `<link rel="mask-icon" href="${icon}" color="#000000">`,
      webManifest: `<link rel="manifest" href="/manifest/${encodeURIComponent(item.id)}.webmanifest">`
    },
    urls: {
      svg: `${origin}${icon}`,
      rasterManifest: `${origin}${rasterBase}/manifest.json`,
      assets: `${origin}/api/assets?q=${encodedName}`,
      manifest: `${origin}/manifest/${encodeURIComponent(item.id)}.webmanifest`
    }
  };
};

export const webManifest = (item) => ({
  name: item.name,
  short_name: item.name,
  icons: [
    {
      src: `/assets/raster/${item.id}/android-chrome-192.png`,
      sizes: "192x192",
      type: "image/png",
      purpose: "any"
    },
    {
      src: `/assets/raster/${item.id}/android-chrome-512.png`,
      sizes: "512x512",
      type: "image/png",
      purpose: "any"
    },
    {
      src: `/assets/raster/${item.id}/android-chrome-512.png`,
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable"
    },
    {
      src: `/${item.icon.path}`,
      sizes: "any",
      type: "image/svg+xml",
      purpose: "any"
    },
    {
      src: `/${item.icon.path}`,
      sizes: "any",
      type: "image/svg+xml",
      purpose: "maskable"
    }
  ],
  theme_color: "#000000",
  background_color: "#ffffff",
  display: "standalone"
});

export const xcodeImageSetContents = (item) => ({
  images: [
    {
      filename: `${item.id}.svg`,
      idiom: "universal"
    }
  ],
  info: {
    author: "models-assets",
    version: 1
  },
  properties: {
    "template-rendering-intent": "original"
  }
});

export const androidAdaptiveIconXml = (item) => `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
  <background android:drawable="@color/ic_launcher_background"/>
  <foreground android:drawable="@drawable/ic_launcher_foreground"/>
  <monochrome android:drawable="@drawable/ic_launcher_monochrome"/>
</adaptive-icon>
`;

export const androidVectorPlaceholderXml = (item) => `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
  android:width="108dp"
  android:height="108dp"
  android:viewportWidth="108"
  android:viewportHeight="108">
  <path
    android:fillColor="#000000"
    android:pathData="M18,18h72v72h-72z"/>
</vector>
<!-- Source SVG: /${item.icon.path} -->
`;
