export const unnamedArtworkTitle = "Unnamed artwork";

export function altTextFromFilename(filename: string) {
  const withoutExtension = filename
    .replace(/\.[^.\\/]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return withoutExtension.length >= 3 ? sentenceCase(withoutExtension) : "Artwork image";
}

function sentenceCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
