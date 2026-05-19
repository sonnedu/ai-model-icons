export const allowedConfidence = new Set(["official", "community", "parent-brand", "placeholder"]);
export const allowedIconQualities = new Set(["vector", "embedded-raster"]);

export const confidenceForIcon = (icon = {}) => {
  const source = icon.source || "";
  const match = icon.match || "";

  if (
    source === "generated-vector" ||
    source === "local-product-vector" ||
    match === "needs-entity-icon"
  ) {
    return "placeholder";
  }

  if (match === "parent-brand" || match === "host-brand") {
    return "parent-brand";
  }

  if (source === "official-website") {
    return "official";
  }

  return "community";
};

