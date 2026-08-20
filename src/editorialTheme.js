(() => {
  const THEMES = {
    black: "Nero",
    yellow: "Giallo",
  };
  const YELLOW_SUFFIX = "-giallo.jpg";
  const EDITORIAL_ASSET_PATH = "/assets/editorial-backgrounds/";
  const yellowCache = new Map();
  let currentTheme = "black";
  let redrawTimer = null;

  function getYellowFilename(filename) {
    if (!filename || !filename.toLowerCase().endsWith(".jpg")) {
      return "";
    }
    return `${filename.slice(0, -4)}${YELLOW_SUFFIX}`;
  }

  function getFilenameFromImage(image) {
    if (!(image instanceof HTMLImageElement) || !image.src.includes(EDITORIAL_ASSET_PATH)) {
      return "";
    }

    try {
      return decodeURIComponent(new URL(image.src, window.location.href).pathname.split("/").pop() || "");
    } catch {
      return "";
    }
  }

  function loadYellowVariant(filename) {
    if (!filename) {
      return Promise.resolve(null);
    }
    const cached = yellowCache.get(filename);
    if (cached instanceof HTMLImageElement) {
      return Promise.resolve(cached);
    }
    if (cached instanceof Promise) {
      return cached;
    }

    const promise = new Promise((resolve) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        yellowCache.set(filename, image);
        resolve(image);
      };
      image.onerror = () => {
        yellowCache.delete(filename);
        console.warn(`Variante gialla non disponibile per ${filename}`);
        resolve(null);
      };
      image.src = `./assets/editorial-backgrounds/${encodeURIComponent(getYellowFilename(filename)).replaceAll("%2F", "/")}`;
    });

    yellowCache.set(filename, promise);
    return promise;
  }

  function requestEditorialRedraw() {
    clearTimeout(redrawTimer);
    redrawTimer = setTimeout(() => {
      const input = document.querySelector('textarea[data-template="editoriale"][data-path="whiteText"]');
      if (input) {
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }, 0);
  }

  async function prepareCurrentYellowAsset() {
    if (currentTheme !== "yellow") {
      return;
    }
    const backgroundSelect = document.querySelector('select[data-template="editoriale"][data-path="background"]');
    if (!backgroundSelect?.value) {
      return;
    }
    await loadYellowVariant(backgroundSelect.value);
    requestEditorialRedraw();
  }

  function injectThemeControl() {
    const backgroundSelect = document.querySelector('select[data-template="editoriale"][data-path="background"]');
    if (!backgroundSelect || document.querySelector("[data-editorial-theme-select]")) {
      return;
    }

    const backgroundField = backgroundSelect.closest(".field");
    if (!backgroundField) {
      return;
    }

    const field = document.createElement("div");
    field.className = "field";
    field.innerHTML = `
      <label class="field-label" for="editoriale-theme">Tema sfondo</label>
      <select id="editoriale-theme" data-editorial-theme-select>
        ${Object.entries(THEMES)
          .map(([value, label]) => `<option value="${value}" ${value === currentTheme ? "selected" : ""}>${label}</option>`)
          .join("")}
      </select>
    `;
    backgroundField.before(field);

    const themeSelect = field.querySelector("[data-editorial-theme-select]");
    themeSelect.addEventListener("change", async () => {
      currentTheme = themeSelect.value in THEMES ? themeSelect.value : "black";
      if (currentTheme === "yellow") {
        await prepareCurrentYellowAsset();
      } else {
        requestEditorialRedraw();
      }
    });

    if (currentTheme === "yellow") {
      prepareCurrentYellowAsset();
    }
  }

  const originalDrawImage = CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage = function patchedDrawImage(...args) {
    if (currentTheme === "yellow" && args.length > 0) {
      const filename = getFilenameFromImage(args[0]);
      if (filename && !filename.toLowerCase().endsWith(YELLOW_SUFFIX)) {
        const yellowImage = yellowCache.get(filename);
        if (yellowImage instanceof HTMLImageElement && yellowImage.complete && yellowImage.naturalWidth > 0) {
          args[0] = yellowImage;
        } else if (!yellowImage) {
          loadYellowVariant(filename).then((image) => {
            if (image && currentTheme === "yellow") {
              requestEditorialRedraw();
            }
          });
        }
      }
    }
    return originalDrawImage.apply(this, args);
  };

  document.addEventListener(
    "change",
    (event) => {
      const target = event.target;
      if (
        currentTheme === "yellow" &&
        target instanceof HTMLSelectElement &&
        target.matches('select[data-template="editoriale"][data-path="background"]')
      ) {
        loadYellowVariant(target.value).then((image) => {
          if (image && currentTheme === "yellow") {
            requestEditorialRedraw();
          }
        });
      }
    },
    true,
  );

  const observer = new MutationObserver(() => injectThemeControl());
  observer.observe(document.documentElement, { childList: true, subtree: true });
  injectThemeControl();
})();
