(() => {
  const THEMES = { black: "Nero", yellow: "Giallo" };
  const EDITORIAL_ASSET_PATH = "/assets/editorial-backgrounds/";
  const BUNDLE_INDEX = {"allenatore.jpg":{"bundle":1,"offset":0,"length":105635},"basket giocatore bianco1.jpg":{"bundle":1,"offset":105635,"length":95898},"calciatore bianco pallone.jpg":{"bundle":1,"offset":201533,"length":81249},"calciatrice bianca.jpg":{"bundle":1,"offset":282782,"length":69049},"chiamata vuota.jpg":{"bundle":1,"offset":351831,"length":12254},"esultanza calciatore.jpg":{"bundle":1,"offset":364085,"length":85677},"italia nazionale.jpg":{"bundle":1,"offset":449762,"length":95931},"persone generiche.jpg":{"bundle":1,"offset":545693,"length":120855},"pilota moto.jpg":{"bundle":1,"offset":666548,"length":87480},"tennista donna 2.jpg":{"bundle":1,"offset":754028,"length":84823},"uomo serio.jpg":{"bundle":1,"offset":838851,"length":92794},"arbitro fischio.jpg":{"bundle":2,"offset":0,"length":80370},"basket giocatore nero1.jpg":{"bundle":2,"offset":80370,"length":93260},"calciatore coppa.jpg":{"bundle":2,"offset":173630,"length":121518},"calciatrice nera.jpg":{"bundle":2,"offset":295148,"length":97497},"ciclista.jpg":{"bundle":2,"offset":392645,"length":105905},"frecce betfair.jpg":{"bundle":2,"offset":498550,"length":21064},"macchina f1.jpg":{"bundle":2,"offset":519614,"length":65633},"persone telefono.jpg":{"bundle":2,"offset":585247,"length":136722},"scarpe italia.jpg":{"bundle":2,"offset":721969,"length":98795},"tennista donna.jpg":{"bundle":2,"offset":820764,"length":76064},"uomo telefono.jpg":{"bundle":2,"offset":896828,"length":90224},"arbitro var.jpg":{"bundle":3,"offset":0,"length":75324},"basket giocatrice1.jpg":{"bundle":3,"offset":75324,"length":83862},"calciatore disperato.jpg":{"bundle":3,"offset":159186,"length":70724},"cartellino giallo.jpg":{"bundle":3,"offset":229910,"length":48093},"contrasto calcio.jpg":{"bundle":3,"offset":278003,"length":84060},"grafico su.jpg":{"bundle":3,"offset":362063,"length":54350},"multisport.jpg":{"bundle":3,"offset":416413,"length":106556},"pilota f1 big.jpg":{"bundle":3,"offset":522969,"length":104113},"scarpe pallone.jpg":{"bundle":3,"offset":627082,"length":100488},"tennista uomo.jpg":{"bundle":3,"offset":727570,"length":87530},"var.jpg":{"bundle":3,"offset":815100,"length":84533},"basket giocatore bianco 2.jpg":{"bundle":4,"offset":0,"length":83879},"calciatore azione.jpg":{"bundle":4,"offset":83879,"length":78842},"calciatore dorato.jpg":{"bundle":4,"offset":162721,"length":82964},"cartellino rosso.jpg":{"bundle":4,"offset":245685,"length":97515},"coppa del mondo.jpg":{"bundle":4,"offset":343200,"length":64486},"infortunio calciatore.jpg":{"bundle":4,"offset":407686,"length":60921},"pallone+coppa.jpg":{"bundle":4,"offset":468607,"length":97089},"pilota f1 small.jpg":{"bundle":4,"offset":565696,"length":86564},"scarpe spagna.jpg":{"bundle":4,"offset":652260,"length":103312},"uomo dubbioso.jpg":{"bundle":4,"offset":755572,"length":92889}};

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
