import { FONT_DEFINITIONS } from "./config.js?v=20261008c";

export async function loadFonts() {
  const fontPromises = FONT_DEFINITIONS.map(async (definition) => {
    try {
      const fontFace = new FontFace(definition.family, `url(${definition.src})`, {
        weight: definition.weight,
        style: "normal",
      });
      const loadedFont = await fontFace.load();
      document.fonts.add(loadedFont);
      return loadedFont;
    } catch (error) {
      console.warn(`Impossibile caricare il font ${definition.family}`, error);
      return null;
    }
  });

  await Promise.allSettled(fontPromises);

  if (document.fonts?.ready) {
    await document.fonts.ready;
  }
}
