(() => {
  const THEMES = { black: "Nero", yellow: "Giallo" };
  const EDITORIAL_ASSET_PATH = "/assets/editorial-backgrounds/";
  const BUNDLE_URL = "./assets/editorial-backgrounds/editorial-yellow.bundle?v=20260820a";
  const BUNDLE_INDEX = {"allenatore.jpg":{"offset":0,"length":68602},"arbitro fischio.jpg":{"offset":68602,"length":52034},"arbitro var.jpg":{"offset":120636,"length":48334},"basket giocatore bianco 2.jpg":{"offset":168970,"length":54435},"basket giocatore bianco1.jpg":{"offset":223405,"length":59539},"basket giocatore nero1.jpg":{"offset":282944,"length":59332},"basket giocatrice1.jpg":{"offset":342276,"length":54310},"calciatore azione.jpg":{"offset":396586,"length":49336},"calciatore bianco pallone.jpg":{"offset":445922,"length":51279},"calciatore coppa.jpg":{"offset":497201,"length":74742},"calciatore disperato.jpg":{"offset":571943,"length":46263},"calciatore dorato.jpg":{"offset":618206,"length":54354},"calciatrice bianca.jpg":{"offset":672560,"length":45002},"calciatrice nera.jpg":{"offset":717562,"length":62580},"cartellino giallo.jpg":{"offset":780142,"length":31506},"cartellino rosso.jpg":{"offset":811648,"length":63128},"chiamata vuota.jpg":{"offset":874776,"length":9426},"ciclista.jpg":{"offset":884202,"length":69599},"contrasto calcio.jpg":{"offset":953801,"length":55587},"coppa del mondo.jpg":{"offset":1009388,"length":40725},"esultanza calciatore.jpg":{"offset":1050113,"length":54315},"frecce betfair.jpg":{"offset":1104428,"length":15494},"grafico su.jpg":{"offset":1119922,"length":36000},"infortunio calciatore.jpg":{"offset":1155922,"length":39395},"italia nazionale.jpg":{"offset":1195317,"length":60704},"macchina f1.jpg":{"offset":1256021,"length":41874},"multisport.jpg":{"offset":1297895,"length":70229},"pallone+coppa.jpg":{"offset":1368124,"length":63271},"persone generiche.jpg":{"offset":1431395,"length":77600},"persone telefono.jpg":{"offset":1508995,"length":86344},"pilota f1 big.jpg":{"offset":1595339,"length":66306},"pilota f1 small.jpg":{"offset":1661645,"length":55709},"pilota moto.jpg":{"offset":1717354,"length":56690},"scarpe italia.jpg":{"offset":1774044,"length":63072},"scarpe pallone.jpg":{"offset":1837116,"length":64412},"scarpe spagna.jpg":{"offset":1901528,"length":65453},"tennista donna 2.jpg":{"offset":1966981,"length":54084},"tennista donna.jpg":{"offset":2021065,"length":48652},"tennista uomo.jpg":{"offset":2069717,"length":54706},"uomo dubbioso.jpg":{"offset":2124423,"length":58009},"uomo serio.jpg":{"offset":2182432,"length":59459},"uomo telefono.jpg":{"offset":2241891,"length":56717},"var.jpg":{"offset":2298608,"length":54952}};

  const yellowCache = new Map();
  let bundlePromise = null;
  let currentTheme = "black";
  let redrawTimer = null;

  function getFilenameFromImage(image) {
    if (!(image instanceof HTMLImageElement) || !image.src.includes(EDITORIAL_ASSET_PATH)) return "";
    try {
      return decodeURIComponent(new URL(image.src, window.location.href).pathname.split("/").pop() || "");
    } catch {
      return "";
    }
  }

  function loadBundle() {
    if (!bundlePromise) {
      bundlePromise = fetch(BUNDLE_URL).then((response) => {
        if (!response.ok) throw new Error(`Bundle giallo non disponibile (${response.status})`);
        return response.arrayBuffer();
      });
    }
    return bundlePromise;
  }

  function loadYellowVariant(filename) {
    if (!filename || !BUNDLE_INDEX[filename]) return Promise.resolve(null);
    const cached = yellowCache.get(filename);
    if (cached instanceof HTMLImageElement) return Promise.resolve(cached);
    if (cached instanceof Promise) return cached;

    const promise = loadBundle()
      .then((buffer) => {
        const { offset, length } = BUNDLE_INDEX[filename];
        const blob = new Blob([buffer.slice(offset, offset + length)], { type: "image/jpeg" });
        const objectUrl = URL.createObjectURL(blob);
        return new Promise((resolve) => {
          const image = new Image();
          image.decoding = "async";
          image.onload = () => {
            URL.revokeObjectURL(objectUrl);
            yellowCache.set(filename, image);
            resolve(image);
          };
          image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            yellowCache.delete(filename);
            resolve(null);
          };
          image.src = objectUrl;
        });
      })
      .catch((error) => {
        yellowCache.delete(filename);
        console.warn(error);
        return null;
      });

    yellowCache.set(filename, promise);
    return promise;
  }

  function requestEditorialRedraw() {
    clearTimeout(redrawTimer);
    redrawTimer = setTimeout(() => {
      const input = document.querySelector('textarea[data-template="editoriale"][data-path="whiteText"]');
      if (input) input.dispatchEvent(new Event("input", { bubbles: true }));
    }, 0);
  }

  async function prepareCurrentYellowAsset() {
    if (currentTheme !== "yellow") return;
    const backgroundSelect = document.querySelector('select[data-template="editoriale"][data-path="background"]');
    if (!backgroundSelect?.value) return;
    await loadYellowVariant(backgroundSelect.value);
    requestEditorialRedraw();
  }

  function injectThemeControl() {
    const backgroundSelect = document.querySelector('select[data-template="editoriale"][data-path="background"]');
    if (!backgroundSelect || document.querySelector("[data-editorial-theme-select]")) return;
    const backgroundField = backgroundSelect.closest(".field");
    if (!backgroundField) return;

    const field = document.createElement("div");
    field.className = "field";
    field.innerHTML = `
      <label class="field-label" for="editoriale-theme">Tema sfondo</label>
      <select id="editoriale-theme" data-editorial-theme-select>
        ${Object.entries(THEMES).map(([value, label]) => `<option value="${value}" ${value === currentTheme ? "selected" : ""}>${label}</option>`).join("")}
      </select>
    `;
    backgroundField.before(field);

    field.querySelector("[data-editorial-theme-select]").addEventListener("change", async (event) => {
      currentTheme = event.target.value in THEMES ? event.target.value : "black";
      if (currentTheme === "yellow") await prepareCurrentYellowAsset();
      else requestEditorialRedraw();
    });

    if (currentTheme === "yellow") prepareCurrentYellowAsset();
  }

  const originalDrawImage = CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage = function patchedDrawImage(...args) {
    if (currentTheme === "yellow" && args.length > 0) {
      const filename = getFilenameFromImage(args[0]);
      if (filename && BUNDLE_INDEX[filename]) {
        const yellowImage = yellowCache.get(filename);
        if (yellowImage instanceof HTMLImageElement && yellowImage.complete && yellowImage.naturalWidth > 0) {
          args[0] = yellowImage;
        } else if (!yellowImage) {
          loadYellowVariant(filename).then((image) => {
            if (image && currentTheme === "yellow") requestEditorialRedraw();
          });
        }
      }
    }
    return originalDrawImage.apply(this, args);
  };

  document.addEventListener("change", (event) => {
    const target = event.target;
    if (currentTheme === "yellow" && target instanceof HTMLSelectElement && target.matches('select[data-template="editoriale"][data-path="background"]')) {
      loadYellowVariant(target.value).then((image) => {
        if (image && currentTheme === "yellow") requestEditorialRedraw();
      });
    }
  }, true);

  const observer = new MutationObserver(injectThemeControl);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  injectThemeControl();
})();
