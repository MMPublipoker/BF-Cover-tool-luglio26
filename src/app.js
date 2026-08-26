import {
  ASSETS,
  BRAND,
  createInitialState,
  getPitchPlayersTemplate,
  PITCH_FORMATION_DEFAULT_PLAYERS,
  PREMATCH_YELLOW_BACKGROUND,
  PREMATCH_YELLOW_TEXT_FIELDS,
} from "./config.js";
import { loadFonts } from "./fontLoader.js";
import {
  ensureResources,
  exportCanvasAsJpeg,
  getEditorialBackgroundResourceEntry,
  getEditorialFlagResourceEntry,
  getPrematchBackgroundResourceEntry,
  getPrematchSubjectLayout,
  getPrematchResourceEntry,
  getReadyAssetReport,
  getStaticResourceEntries,
  renderActiveCover,
} from "./renderers.js";
import { renderLoadingScreen, renderShell } from "./ui.js";

const app = document.querySelector("#app");
const state = createInitialState();
let resources = new Map();
let canvas = null;
let ctx = null;
let dragState = null;

function setByPath(object, path, value) {
  const keys = path.split(".");
  const lastKey = keys.pop();
  const target = keys.reduce((result, key) => result[key], object);
  target[lastKey] = value;
}

function parseInputValue(target) {
  if (target.type === "range") {
    return Number(target.value);
  }

  return target.value;
}

function sanitizeFilenamePart(value) {
  return String(value)
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .replaceAll(/[^a-zA-Z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "")
    .toLowerCase();
}

function getTodayStamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildDownloadFilename() {
  const dateStamp = getTodayStamp();

  if (state.activeTemplate === "prematch") {
    const parts = [
      sanitizeFilenamePart(state.prematch.teamA),
      sanitizeFilenamePart(state.prematch.teamB),
      "pronostico",
      dateStamp,
    ].filter(Boolean);

    return `${parts.join("-")}.jpg`;
  }

  const editorialText = [state.editoriale.whiteText, state.editoriale.yellowText]
    .map((text) => text.trim())
    .filter(Boolean)
    .join(" ");
  const editorialBase = sanitizeFilenamePart(editorialText) || "editoriale";
  return `${editorialBase}.jpg`;
}

function refreshRangeValue(target) {
  const template = target.dataset.template;
  const path = target.dataset.path;
  if (!template || !path || target.type !== "range") {
    return;
  }

  const valueElement = app.querySelector(`[data-value-for="${template}:${path}"]`);
  if (valueElement) {
    valueElement.textContent = `${target.value}%`;
  }
}

function refreshColorCode(target) {
  if (target.type !== "color") {
    return;
  }

  const code = target.closest(".color-field")?.querySelector("code");
  if (code) {
    code.textContent = target.value.toUpperCase();
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function syncTransformControls(teamKey) {
  const transform = state.prematch.transforms[teamKey];
  ["size", "offsetX", "offsetY"].forEach((field) => {
    const path = `transforms.${teamKey}.${field}`;
    const input = app.querySelector(`input[data-template="prematch"][data-path="${path}"]`);
    const value = Math.round(transform[field]);
    if (input) {
      input.value = String(value);
    }
    const valueElement = app.querySelector(`[data-value-for="prematch:${path}"]`);
    if (valueElement) {
      valueElement.textContent = `${value}%`;
    }
  });
}

function getCanvasPoint(event) {
  if (!canvas) {
    return null;
  }

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

function getPrematchSubjectHitboxes() {
  const subjects = [
    { teamKey: "teamA", side: "left", assetKey: state.prematch.teamAAsset },
    { teamKey: "teamB", side: "right", assetKey: state.prematch.teamBAsset },
  ];

  return subjects
    .map(({ teamKey, side, assetKey }) => {
      const image = resources.get(`prematch:${assetKey}`);
      if (!image) {
        return null;
      }

      const layout = getPrematchSubjectLayout(
        side,
        state.prematch.transforms[teamKey],
        ASSETS.prematchTeamAssets[assetKey],
        image,
      );

      return { teamKey, ...layout };
    })
    .filter(Boolean);
}

function getHitSubject(point) {
  const hitboxes = getPrematchSubjectHitboxes();
  for (let index = hitboxes.length - 1; index >= 0; index -= 1) {
    const hitbox = hitboxes[index];
    if (
      point.x >= hitbox.x &&
      point.x <= hitbox.x + hitbox.width &&
      point.y >= hitbox.y &&
      point.y <= hitbox.y + hitbox.height
    ) {
      return hitbox;
    }
  }
  return null;
}

function updateCanvasCursor(point = null) {
  if (!canvas) {
    return;
  }

  if (dragState) {
    canvas.style.cursor = "grabbing";
    return;
  }

  if (state.activeTemplate !== "prematch") {
    canvas.style.cursor = "default";
    return;
  }

  const hitSubject = point ? getHitSubject(point) : null;
  canvas.style.cursor = hitSubject ? "grab" : "default";
}

function drawCurrentPreview() {
  if (!ctx) {
    return;
  }

  renderActiveCover(ctx, state, resources);
}

async function syncResourcesForCurrentState() {
  const entries = [...getStaticResourceEntries()];

  if (state.activeTemplate === "prematch") {
    const backgroundEntry = getPrematchBackgroundResourceEntry(state.prematch.background);
    if (backgroundEntry) {
      entries.push(backgroundEntry);
    }
    const teamAEntry = getPrematchResourceEntry(state.prematch.teamAAsset);
    const teamBEntry = getPrematchResourceEntry(state.prematch.teamBAsset);
    if (teamAEntry) {
      entries.push(teamAEntry);
    }
    if (teamBEntry) {
      entries.push(teamBEntry);
    }
  }

  if (state.activeTemplate === "editoriale") {
    const backgroundEntry = getEditorialBackgroundResourceEntry(state.editoriale.background);
    if (backgroundEntry) {
      entries.push(backgroundEntry);
    }
    if (state.editoriale.background === "chiamata vuota.jpg" && state.editoriale.flagAsset) {
      const flagEntry = getEditorialFlagResourceEntry(state.editoriale.flagAsset);
      if (flagEntry) {
        entries.push(flagEntry);
      }
    }
  }

  await ensureResources(resources, entries.filter((entry) => entry[1]));
}

function mountShell() {
  app.innerHTML = renderShell(state, getReadyAssetReport(resources));
  canvas = document.querySelector("#cover-canvas");
  ctx = canvas.getContext("2d");
  dragState = null;
  canvas.addEventListener("pointerdown", handleCanvasPointerDown);
  canvas.addEventListener("pointermove", handleCanvasPointerMove);
  canvas.addEventListener("pointerup", handleCanvasPointerUp);
  canvas.addEventListener("pointercancel", handleCanvasPointerUp);
  canvas.addEventListener("pointerleave", handleCanvasPointerLeave);
  updateCanvasCursor();
  drawCurrentPreview();
}

function closeAssetDropdowns(exceptDropdown = null) {
  app.querySelectorAll("[data-asset-dropdown].is-open").forEach((dropdown) => {
    if (dropdown === exceptDropdown) {
      return;
    }

    dropdown.classList.remove("is-open");
    dropdown.querySelector("[data-action='toggle-asset-dropdown']")?.setAttribute("aria-expanded", "false");
  });
}

function setAssetDropdownPreview(option) {
  const dropdown = option.closest("[data-asset-dropdown]");
  const image = dropdown?.querySelector("[data-asset-preview-image]");
  const placeholder = dropdown?.querySelector("[data-asset-preview-placeholder]");
  const label = dropdown?.querySelector("[data-asset-preview-label]");
  const variant = dropdown?.querySelector("[data-asset-preview-variant]");

  if (!dropdown || !image || !placeholder || !label || !variant) {
    return;
  }

  dropdown.querySelectorAll(".asset-dropdown-option.is-previewing").forEach((previewedOption) => {
    previewedOption.classList.remove("is-previewing");
  });

  option.classList.add("is-previewing");
  const src = option.dataset.src ?? "";
  image.src = src;
  image.alt = `Anteprima ${option.dataset.label ?? "asset"}`;
  image.classList.toggle("hidden", !src);
  placeholder.classList.toggle("hidden", Boolean(src));
  label.textContent = option.dataset.label ?? "";
  variant.textContent = option.dataset.variant ?? "";
}

function getVisibleAssetOptions(dropdown) {
  return Array.from(dropdown.querySelectorAll(".asset-dropdown-option")).filter(
    (option) => !option.classList.contains("is-hidden"),
  );
}

function resetAssetDropdownSearch(dropdown) {
  const search = dropdown.querySelector("[data-asset-search]");
  if (search) {
    search.value = "";
  }

  dropdown.querySelectorAll(".asset-dropdown-option, .asset-dropdown-group").forEach((element) => {
    element.classList.remove("is-hidden");
  });
  dropdown.querySelector("[data-asset-empty]")?.classList.remove("is-visible");
}

function filterAssetDropdown(search) {
  const dropdown = search.closest("[data-asset-dropdown]");
  if (!dropdown) {
    return;
  }

  const query = search.value.trim().toLocaleLowerCase("it-IT");
  const options = Array.from(dropdown.querySelectorAll(".asset-dropdown-option"));

  options.forEach((option) => {
    const label = option.dataset.label?.toLocaleLowerCase("it-IT") ?? "";
    option.classList.toggle("is-hidden", query.length > 0 && !label.includes(query));
  });

  dropdown.querySelectorAll(".asset-dropdown-group").forEach((group) => {
    const hasVisibleOption = Boolean(group.querySelector(".asset-dropdown-option:not(.is-hidden)"));
    group.classList.toggle("is-hidden", !hasVisibleOption);
  });

  const visibleOptions = getVisibleAssetOptions(dropdown);
  dropdown.querySelector("[data-asset-empty]")?.classList.toggle("is-visible", visibleOptions.length === 0);

  if (visibleOptions.length > 0) {
    const previewOption = query ? visibleOptions[0] : dropdown.querySelector(".asset-dropdown-option.is-selected") ?? visibleOptions[0];
    setAssetDropdownPreview(previewOption);
  }
}

function toggleAssetDropdown(trigger) {
  const dropdown = trigger.closest("[data-asset-dropdown]");
  if (!dropdown) {
    return;
  }

  const nextOpen = !dropdown.classList.contains("is-open");
  closeAssetDropdowns(dropdown);
  dropdown.classList.toggle("is-open", nextOpen);
  trigger.setAttribute("aria-expanded", String(nextOpen));

  if (nextOpen) {
    resetAssetDropdownSearch(dropdown);
    const selectedOption = dropdown.querySelector(".asset-dropdown-option.is-selected") ?? dropdown.querySelector(".asset-dropdown-option");
    if (selectedOption) {
      setAssetDropdownPreview(selectedOption);
    }
    dropdown.querySelector("[data-asset-search]")?.focus();
  }
}

async function selectAssetOption(option) {
  const dropdown = option.closest("[data-asset-dropdown]");
  const input = dropdown?.querySelector("input[data-template][data-path]");
  if (!dropdown || !input) {
    return;
  }

  const { template, path } = input.dataset;
  const value = option.dataset.value;
  if (!template || !path || value === undefined) {
    return;
  }

  input.value = value;
  setByPath(state[template], path, value);
  const selectedLabel = dropdown.querySelector("[data-asset-selected-label]");
  const selectedVariant = dropdown.querySelector("[data-asset-selected-variant]");
  if (selectedLabel) {
    selectedLabel.textContent = option.dataset.label ?? "";
  }
  if (selectedVariant) {
    selectedVariant.textContent = option.dataset.variant ?? "";
  }
  dropdown.querySelectorAll(".asset-dropdown-option").forEach((assetOption) => {
    const selected = assetOption === option;
    assetOption.classList.toggle("is-selected", selected);
    assetOption.setAttribute("aria-selected", String(selected));
  });
  setAssetDropdownPreview(option);
  dropdown.classList.remove("is-open");
  dropdown.querySelector("[data-action='toggle-asset-dropdown']")?.setAttribute("aria-expanded", "false");

  await syncResourcesForCurrentState();
  drawCurrentPreview();
}

async function switchTemplate(nextTemplate) {
  if (state.activeTemplate === nextTemplate) {
    return;
  }

  state.activeTemplate = nextTemplate;
  await syncResourcesForCurrentState();
  mountShell();
}

function handleCanvasPointerDown(event) {
  if (state.activeTemplate !== "prematch") {
    return;
  }

  const point = getCanvasPoint(event);
  if (!point) {
    return;
  }

  const hitSubject = getHitSubject(point);
  if (!hitSubject) {
    updateCanvasCursor(point);
    return;
  }

  dragState = {
    pointerId: event.pointerId,
    teamKey: hitSubject.teamKey,
    startClientX: event.clientX,
    startClientY: event.clientY,
    startOffsetX: state.prematch.transforms[hitSubject.teamKey].offsetX,
    startOffsetY: state.prematch.transforms[hitSubject.teamKey].offsetY,
    movementX: hitSubject.movementX,
    movementY: hitSubject.movementY,
  };
  canvas.setPointerCapture(event.pointerId);
  updateCanvasCursor(point);
}

function handleCanvasPointerMove(event) {
  const point = getCanvasPoint(event);
  if (!point) {
    return;
  }

  if (!dragState || dragState.pointerId !== event.pointerId) {
    updateCanvasCursor(point);
    return;
  }

  const transform = state.prematch.transforms[dragState.teamKey];
  const deltaX = ((event.clientX - dragState.startClientX) / dragState.movementX) * 100;
  const deltaY = ((event.clientY - dragState.startClientY) / dragState.movementY) * 100;
  transform.offsetX = clamp(dragState.startOffsetX + deltaX, -100, 100);
  transform.offsetY = clamp(dragState.startOffsetY + deltaY, -100, 100);
  syncTransformControls(dragState.teamKey);
  drawCurrentPreview();
  updateCanvasCursor(point);
}

function handleCanvasPointerUp(event) {
  if (!dragState || dragState.pointerId !== event.pointerId) {
    return;
  }

  dragState = null;
  canvas.releasePointerCapture(event.pointerId);
  updateCanvasCursor(getCanvasPoint(event));
}

function handleCanvasPointerLeave() {
  if (!dragState && canvas) {
    canvas.style.cursor = "default";
  }
}

async function handleInput(event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement)) {
    return;
  }

  const { template, path } = target.dataset;
  if (!template || !path) {
    return;
  }

  const templateState = state[template];
  const previousValue = path === "pitchFormation" ? templateState.pitchFormation : null;
  setByPath(templateState, path, parseInputValue(target));

  if (template === "editoriale" && path === "pitchFormation") {
    const defaultTemplates = new Set(
      Object.keys(PITCH_FORMATION_DEFAULT_PLAYERS).map((formationKey) => getPitchPlayersTemplate(formationKey)),
    );
    if (!templateState.pitchPlayers.trim() || defaultTemplates.has(templateState.pitchPlayers) || templateState.pitchPlayers === getPitchPlayersTemplate(previousValue)) {
      templateState.pitchPlayers = getPitchPlayersTemplate(templateState.pitchFormation);
    }
  }

  if (template === "prematch" && path === "background" && templateState.background === PREMATCH_YELLOW_BACKGROUND) {
    PREMATCH_YELLOW_TEXT_FIELDS.forEach((field) => {
      if (templateState.textColors[field] === BRAND.yellow) {
        templateState.textColors[field] = BRAND.black;
      }
    });
  }

  refreshRangeValue(target);
  refreshColorCode(target);
  await syncResourcesForCurrentState();

  if (
    (template === "editoriale" && (path === "background" || path === "chiamataVuotaMode" || path === "pitchFormation")) ||
    (template === "prematch" && path === "background")
  ) {
    mountShell();
    return;
  }

  drawCurrentPreview();
}

async function handleClick(event) {
  const trigger = event.target instanceof HTMLElement ? event.target.closest("[data-action]") : null;
  if (!trigger) {
    const clickTarget = event.target instanceof HTMLElement ? event.target : null;
    if (!clickTarget?.closest("[data-asset-dropdown]")) {
      closeAssetDropdowns();
    }
    return;
  }

  const action = trigger.dataset.action;
  if (action === "toggle-asset-dropdown") {
    toggleAssetDropdown(trigger);
    return;
  }

  if (action === "select-asset-option") {
    await selectAssetOption(trigger);
    return;
  }

  closeAssetDropdowns();

  if (action === "switch-template") {
    await switchTemplate(trigger.dataset.templateKey);
    return;
  }

  if (action === "download-jpeg") {
    const name = buildDownloadFilename();
    exportCanvasAsJpeg(canvas, name);
  }
}

function handleAssetOptionPreview(event) {
  const option = event.target instanceof HTMLElement ? event.target.closest(".asset-dropdown-option") : null;
  if (option && !option.classList.contains("is-hidden")) {
    setAssetDropdownPreview(option);
  }
}

function handleAssetSearch(event) {
  const search = event.target instanceof HTMLInputElement ? event.target.closest("[data-asset-search]") : null;
  if (search) {
    filterAssetDropdown(search);
  }
}

function handleKeydown(event) {
  const target = event.target instanceof HTMLElement ? event.target : null;
  const dropdown = target?.closest("[data-asset-dropdown]");
  if (!dropdown) {
    return;
  }

  const options = getVisibleAssetOptions(dropdown);
  const currentIndex = options.indexOf(target);
  const toggle = dropdown.querySelector("[data-action='toggle-asset-dropdown']");
  const search = dropdown.querySelector("[data-asset-search]");

  if (event.key === "Escape") {
    closeAssetDropdowns();
    toggle?.focus();
    return;
  }

  if (target === toggle && (event.key === "Enter" || event.key === " " || event.key === "ArrowDown")) {
    event.preventDefault();
    toggleAssetDropdown(toggle);
    return;
  }

  if (target === search) {
    if (event.key === "ArrowDown" && options.length > 0) {
      event.preventDefault();
      options[0].focus();
      setAssetDropdownPreview(options[0]);
      return;
    }

    if (event.key === "Enter" && options.length > 0) {
      event.preventDefault();
      selectAssetOption(options[0]);
    }
    return;
  }

  if (currentIndex === -1) {
    return;
  }

  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    const direction = event.key === "ArrowDown" ? 1 : -1;
    const nextIndex = (currentIndex + direction + options.length) % options.length;
    options[nextIndex].focus();
    setAssetDropdownPreview(options[nextIndex]);
    return;
  }

  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    selectAssetOption(target);
  }
}

async function init() {
  app.innerHTML = renderLoadingScreen();
  await loadFonts();
  resources = new Map();
  await syncResourcesForCurrentState();
  mountShell();
}

app.addEventListener("input", handleInput);
app.addEventListener("input", handleAssetSearch);
app.addEventListener("change", handleInput);
app.addEventListener("click", handleClick);
app.addEventListener("mouseover", handleAssetOptionPreview);
app.addEventListener("focusin", handleAssetOptionPreview);
app.addEventListener("keydown", handleKeydown);
window.addEventListener("resize", drawCurrentPreview);

init().catch((error) => {
  console.error(error);
  app.innerHTML = `
    <div class="loading-state">
      <div class="loading-card">
        <span class="eyebrow">BETFAIR COVER TOOL</span>
        <h1>Errore in avvio</h1>
        <p>Controlla console e asset locali. Il tool non è riuscito a inizializzarsi correttamente.</p>
      </div>
    </div>
  `;
});
