(() => {
  const THEMES = { black: "Nero", yellow: "Giallo" };
  const EDITORIAL_ASSET_PATH = "/assets/editorial-backgrounds/";
  const BUNDLE_INDEX = {"allenatore.jpg":{"bundle":1,"offset":0,"length":68602},"basket giocatore bianco1.jpg":{"bundle":1,"offset":68602,"length":59539},"calciatore bianco pallone.jpg":{"bundle":1,"offset":128141,"length":51279},"calciatrice bianca.jpg":{"bundle":1,"offset":179420,"length":45002},"chiamata vuota.jpg":{"bundle":1,"offset":224422,"length":9426},"esultanza calciatore.jpg":{"bundle":1,"offset":233848,"length":54315},"italia nazionale.jpg":{"bundle":1,"offset":288163,"length":60704},"persone generiche.jpg":{"bundle":1,"offset":348867,"length":77600},"pilota moto.jpg":{"bundle":1,"offset":426467,"length":56690},"tennista donna 2.jpg":{"bundle":1,"offset":483157,"length":54084},"uomo serio.jpg":{"bundle":1,"offset":537241,"length":59459},"arbitro fischio.jpg":{"bundle":2,"offset":0,"length":52034},"basket giocatore nero1.jpg":{"bundle":2,"offset":52034,"length":59332},"calciatore coppa.jpg":{"bundle":2,"offset":111366,"length":74742},"calciatrice nera.jpg":{"bundle":2,"offset":186108,"length":62580},"ciclista.jpg":{"bundle":2,"offset":248688,"length":69599},"frecce betfair.jpg":{"bundle":2,"offset":318287,"length":15494},"macchina f1.jpg":{"bundle":2,"offset":333781,"length":41874},"persone telefono.jpg":{"bundle":2,"offset":375655,"length":86344},"scarpe italia.jpg":{"bundle":2,"offset":461999,"length":63072},"tennista donna.jpg":{"bundle":2,"offset":525071,"length":48652},"uomo telefono.jpg":{"bundle":2,"offset":573723,"length":56717},"arbitro var.jpg":{"bundle":3,"offset":0,"length":48334},"basket giocatrice1.jpg":{"bundle":3,"offset":48334,"length":54310},"calciatore disperato.jpg":{"bundle":3,"offset":102644,"length":46263},"cartellino giallo.jpg":{"bundle":3,"offset":148907,"length":31506},"contrasto calcio.jpg":{"bundle":3,"offset":180413,"length":55587},"grafico su.jpg":{"bundle":3,"offset":236000,"length":36000},"multisport.jpg":{"bundle":3,"offset":272000,"length":70229},"pilota f1 big.jpg":{"bundle":3,"offset":342229,"length":66306},"scarpe pallone.jpg":{"bundle":3,"offset":408535,"length":64412},"tennista uomo.jpg":{"bundle":3,"offset":472947,"length":54706},"var.jpg":{"bundle":3,"offset":527653,"length":54952},"basket giocatore bianco 2.jpg":{"bundle":4,"offset":0,"length":54435},"calciatore azione.jpg":{"bundle":4,"offset":54435,"length":49336},"calciatore dorato.jpg":{"bundle":4,"offset":103771,"length":54354},"cartellino rosso.jpg":{"bundle":4,"offset":158125,"length":63128},"coppa del mondo.jpg":{"bundle":4,"offset":221253,"length":40725},"infortunio calciatore.jpg":{"bundle":4,"offset":261978,"length":39395},"pallone+coppa.jpg":{"bundle":4,"offset":301373,"length":63271},"pilota f1 small.jpg":{"bundle":4,"offset":364644,"length":55709},"scarpe spagna.jpg":{"bundle":4,"offset":420353,"length":65453},"uomo dubbioso.jpg":{"bundle":4,"offset":485806,"length":58009}};

  const yellowCache = new Map();
  const bundlePromises = new Map();
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

  function loadBundle(bundleNumber) {
    if (!bundlePromises.has(bundleNumber)) {
      const url = `./assets/editorial-backgrounds/editorial-yellow-${bundleNumber}.bundle?v=20260820a`;
      bundlePromises.set(bundleNumber, fetch(url).then((response) => {
        if (!response.ok) throw new Error(`Bundle giallo ${bundleNumber} non disponibile (${response.status})`);
        return response.arrayBuffer();
      }));
    }
    return bundlePromises.get(bundleNumber);
  }

  function loadYellowVariant(filename) {
    const meta = BUNDLE_INDEX[filename];
    if (!filename || !meta) return Promise.resolve(null);
    const cached = yellowCache.get(filename);
    if (cached instanceof HTMLImageElement) return Promise.resolve(cached);
    if (cached instanceof Promise) return cached;

    const promise = loadBundle(meta.bundle)
      .then((buffer) => {
        const blob = new Blob([buffer.slice(meta.offset, meta.offset + meta.length)], { type: "image/jpeg" });
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
