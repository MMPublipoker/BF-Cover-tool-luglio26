import {
  CHIAMATA_VUOTA_MODE_OPTIONS,
  COVER_HEIGHT,
  COVER_WIDTH,
  EDITORIAL_BACKGROUND_OPTIONS,
  EDITORIAL_COLOR_FIELDS,
  EDITORIAL_FLAG_OPTIONS,
  PITCH_DOT_STYLE_OPTIONS,
  PITCH_FORMATION_OPTIONS,
  PREMATCH_ASSET_OPTIONS,
  PREMATCH_BACKGROUND_OPTIONS,
  TEMPLATES,
} from "./config.js?v=20261008c";

const TEXT_COLOR_OPTIONS = [
  { label: "Giallo", value: "#FFB80C" },
  { label: "Bianco", value: "#FFFFFF" },
  { label: "Nero", value: "#0D0D0D" },
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getByPath(object, path) {
  return path.split(".").reduce((result, key) => result?.[key], object);
}

function flattenOptions(options) {
  return options.flatMap((option) => {
    if (typeof option !== "string" && "options" in option && Array.isArray(option.options)) {
      return option.options;
    }

    return [option];
  });
}

function findOptionByValue(options, value) {
  return flattenOptions(options).find((option) => typeof option !== "string" && option.value === value);
}

function renderAssetPreview(option, emptyLabel = "Nessuna selezione") {
  return `
    <div class="asset-hover-preview" data-asset-hover-preview>
      <div class="asset-hover-preview-image">
        <img
          src="${escapeHtml(option?.src ?? "")}"
          alt="Anteprima ${escapeHtml(option?.label ?? emptyLabel)}"
          data-asset-preview-image
          class="${option?.src ? "" : "hidden"}"
        />
        <span class="asset-preview-placeholder ${option?.src ? "hidden" : ""}" data-asset-preview-placeholder>${escapeHtml(emptyLabel)}</span>
      </div>
      <div class="asset-hover-preview-meta">
        <span data-asset-preview-label>${escapeHtml(option?.label ?? emptyLabel)}</span>
        <small data-asset-preview-variant>${escapeHtml(option?.variant ?? "")}</small>
      </div>
    </div>
  `;
}

function renderAssetOption(option, value) {
  const selected = option.value === value;
  return `
    <button
      class="asset-dropdown-option ${selected ? "is-selected" : ""}"
      type="button"
      role="option"
      aria-selected="${selected}"
      data-action="select-asset-option"
      data-value="${escapeHtml(option.value)}"
      data-label="${escapeHtml(option.label)}"
      data-variant="${escapeHtml(option.variant ?? "")}"
      data-src="${escapeHtml(option.src)}"
    >
      ${escapeHtml(option.label)}
    </button>
  `;
}

function renderAssetSelectField({
  label,
  path,
  value,
  template,
  options,
  emptyOptionLabel = "",
  searchPlaceholder = "Cerca asset",
}) {
  const selectedOption = findOptionByValue(options, value) ?? null;
  const firstOption = flattenOptions(options).find((option) => typeof option !== "string") ?? null;
  if (!selectedOption && !firstOption && !emptyOptionLabel) {
    return "";
  }

  const previewOption = selectedOption ?? null;
  const optionMarkup = options
    .map((option) => {
      if (typeof option === "string" || !("options" in option) || !Array.isArray(option.options)) {
        return typeof option === "string" ? "" : renderAssetOption(option, value);
      }

      return `
        <div class="asset-dropdown-group">
          <span class="asset-dropdown-heading">${escapeHtml(option.label)}</span>
          ${option.options.map((nestedOption) => renderAssetOption(nestedOption, value)).join("")}
        </div>
      `;
    })
    .join("");

  return `
    <div class="field asset-select-field" data-asset-dropdown>
      <label class="field-label" for="${template}-${path}-toggle">${label}</label>
      <input
        type="hidden"
        value="${escapeHtml(value)}"
        data-template="${template}"
        data-path="${path}"
      />
      <button
        id="${template}-${path}-toggle"
        class="asset-dropdown-toggle"
        type="button"
        aria-haspopup="listbox"
        aria-expanded="false"
        data-action="toggle-asset-dropdown"
      >
        <span data-asset-selected-label>${escapeHtml(selectedOption?.label ?? (emptyOptionLabel || "Seleziona"))}</span>
        <small data-asset-selected-variant>${escapeHtml(selectedOption?.variant ?? "")}</small>
      </button>
      <div class="asset-dropdown-menu" role="listbox">
        <div class="asset-dropdown-list">
          <input
            class="asset-dropdown-search"
            type="search"
            placeholder="${escapeHtml(searchPlaceholder)}"
            autocomplete="off"
            data-asset-search
          />
          <div class="asset-dropdown-options">
            ${
              emptyOptionLabel
                ? renderAssetOption({ value: "", label: emptyOptionLabel, src: "", variant: "" }, value)
                : ""
            }
            ${optionMarkup}
          </div>
          <div class="asset-dropdown-empty" data-asset-empty>Nessun risultato</div>
        </div>
        ${renderAssetPreview(previewOption, emptyOptionLabel || "Nessuna selezione")}
      </div>
    </div>
  `;
}

function renderInlineColorSelect({ template, colorPath, colorValue }) {
  const optionsMarkup = TEXT_COLOR_OPTIONS.map(
    (option) => `
      <option value="${option.value}" ${option.value === colorValue ? "selected" : ""}>${option.label}</option>
    `,
  ).join("");

  return `
    <div class="inline-color-picker">
      <span class="inline-color-label">Colore</span>
      <select
        class="inline-color-select"
        data-template="${template}"
        data-path="${colorPath}"
      >
        ${optionsMarkup}
      </select>
    </div>
  `;
}

function renderTextField({
  label,
  path,
  value,
  type = "text",
  template,
  placeholder = "",
  colorPath = "",
  colorValue = "",
  compact = false,
}) {
  if (colorPath) {
    return `
      <div class="field ${compact ? "field-compact" : ""}">
        <label class="field-label" for="${template}-${path}">${label}</label>
        <div class="text-field-card">
          <input
            id="${template}-${path}"
            class="text-field-input"
            type="${type}"
            value="${escapeHtml(value)}"
            placeholder="${escapeHtml(placeholder)}"
            data-template="${template}"
            data-path="${path}"
          />
          ${renderInlineColorSelect({ template, colorPath, colorValue })}
        </div>
      </div>
    `;
  }

  return `
    <div class="field">
      <label class="field-label" for="${template}-${path}">${label}</label>
      <input
        id="${template}-${path}"
        type="${type}"
        value="${escapeHtml(value)}"
        placeholder="${escapeHtml(placeholder)}"
        data-template="${template}"
        data-path="${path}"
      />
    </div>
  `;
}

function renderTextareaField({ label, path, value, template }) {
  return `
    <div class="field">
      <label class="field-label" for="${template}-${path}">${label}</label>
      <textarea id="${template}-${path}" data-template="${template}" data-path="${path}">${escapeHtml(value)}</textarea>
    </div>
  `;
}

function renderSelectField({ label, path, value, template, options }) {
  const optionMarkup = options
    .map((option) => {
      if (typeof option === "string") {
        return `
          <option value="${escapeHtml(option)}" ${option === value ? "selected" : ""}>${escapeHtml(option)}</option>
        `;
      }

      if ("options" in option && Array.isArray(option.options)) {
        const groupedOptions = option.options
          .map(
            (nestedOption) => `
              <option value="${escapeHtml(nestedOption.value)}" ${nestedOption.value === value ? "selected" : ""}>${escapeHtml(nestedOption.label)}</option>
            `,
          )
          .join("");

        return `
          <optgroup label="${escapeHtml(option.label)}">
            ${groupedOptions}
          </optgroup>
        `;
      }

      return `
        <option value="${escapeHtml(option.value)}" ${option.value === value ? "selected" : ""}>${escapeHtml(option.label)}</option>
      `;
    })
    .join("");

  return `
    <div class="field">
      <label class="field-label" for="${template}-${path}">${label}</label>
      <select id="${template}-${path}" data-template="${template}" data-path="${path}">
        ${optionMarkup}
      </select>
    </div>
  `;
}

function renderRangeField({ label, path, value, template, min, max, step = 1 }) {
  return `
    <div class="field">
      <div class="field-label-row">
        <label class="field-label" for="${template}-${path}">${label}</label>
        <span class="field-value" data-value-for="${template}:${path}">${value}%</span>
      </div>
      <input
        id="${template}-${path}"
        class="range-input"
        type="range"
        min="${min}"
        max="${max}"
        step="${step}"
        value="${value}"
        data-template="${template}"
        data-path="${path}"
      />
    </div>
  `;
}

function renderColorField(template, state, field) {
  const value = getByPath(state, field.path);
  return `
    <div class="color-field">
      <span class="color-label">${field.label}</span>
      <div class="color-input-wrap">
        <code>${escapeHtml(value)}</code>
        <input type="color" value="${escapeHtml(value)}" data-template="${template}" data-path="${field.path}" />
      </div>
    </div>
  `;
}

function renderPrematchForm(state) {
  return `
    <div class="panel-card">
      <span class="section-eyebrow">Template attivo</span>
      <h2 class="section-title">${TEMPLATES.prematch.title}</h2>
      <p class="section-copy">${TEMPLATES.prematch.subtitle}</p>

      <div class="fields">
        <div class="field-grid field-grid-three">
          ${renderTextField({
            label: "Squadra A",
            path: "teamA",
            value: state.teamA,
            template: "prematch",
            colorPath: "textColors.teamA",
            colorValue: state.textColors.teamA,
            compact: true,
          })}
          ${renderTextField({
            label: "X",
            path: "xLabel",
            value: state.xLabel,
            template: "prematch",
            colorPath: "textColors.centerX",
            colorValue: state.textColors.centerX,
            compact: true,
          })}
          ${renderTextField({
            label: "Squadra B",
            path: "teamB",
            value: state.teamB,
            template: "prematch",
            colorPath: "textColors.teamB",
            colorValue: state.textColors.teamB,
            compact: true,
          })}
        </div>

        <div class="field-grid">
          ${renderTextField({
            label: "Competition A Name",
            path: "competitionA",
            value: state.competitionA,
            template: "prematch",
            colorPath: "textColors.competitionA",
            colorValue: state.textColors.competitionA,
          })}
          ${renderTextField({
            label: "Competition B Name",
            path: "competitionB",
            value: state.competitionB,
            template: "prematch",
            colorPath: "textColors.competitionB",
            colorValue: state.textColors.competitionB,
          })}
        </div>

        <div class="field-grid field-grid-three">
          ${renderTextField({
            label: "Team A Odds",
            path: "oddsA",
            value: state.oddsA,
            template: "prematch",
            colorPath: "textColors.teamAOdds",
            colorValue: state.textColors.teamAOdds,
            compact: true,
          })}
          ${renderTextField({
            label: "Draw Odds",
            path: "oddsDraw",
            value: state.oddsDraw,
            template: "prematch",
            colorPath: "textColors.drawOdds",
            colorValue: state.textColors.drawOdds,
            compact: true,
          })}
          ${renderTextField({
            label: "Team B Odds",
            path: "oddsB",
            value: state.oddsB,
            template: "prematch",
            colorPath: "textColors.teamBOdds",
            colorValue: state.textColors.teamBOdds,
            compact: true,
          })}
        </div>

        ${renderTextField({
          label: "Event Copy",
          path: "eventCopy",
          value: state.eventCopy,
          template: "prematch",
          colorPath: "textColors.eventCopy",
          colorValue: state.textColors.eventCopy,
        })}

        ${renderSelectField({
          label: "Background Prematch",
          path: "background",
          value: state.background,
          template: "prematch",
          options: PREMATCH_BACKGROUND_OPTIONS,
        })}

        <div class="field-grid">
          ${renderAssetSelectField({
            label: "Asset Grafico Team A",
            path: "teamAAsset",
            value: state.teamAAsset,
            template: "prematch",
            options: PREMATCH_ASSET_OPTIONS,
            searchPlaceholder: "Cerca squadra",
          })}
          ${renderAssetSelectField({
            label: "Asset Grafico Team B",
            path: "teamBAsset",
            value: state.teamBAsset,
            template: "prematch",
            options: PREMATCH_ASSET_OPTIONS,
            searchPlaceholder: "Cerca squadra",
          })}
        </div>

      </div>
    </div>
  `;
}

function renderEditorialForm(state) {
  return `
    <div class="panel-card">
      <span class="section-eyebrow">Template attivo</span>
      <h2 class="section-title">${TEMPLATES.editoriale.title}</h2>
      <p class="section-copy">${TEMPLATES.editoriale.subtitle}</p>

      <div class="fields">
        ${renderTextareaField({ label: "White Text", path: "whiteText", value: state.whiteText, template: "editoriale" })}
        ${renderTextareaField({ label: "Yellow Text", path: "yellowText", value: state.yellowText, template: "editoriale" })}

        ${renderSelectField({
          label: "Background Editoriale",
          path: "background",
          value: state.background,
          template: "editoriale",
          options: EDITORIAL_BACKGROUND_OPTIONS,
        })}

        <div class="field-grid">
          ${renderRangeField({
            label: "Size Scritta Bianca",
            path: "whiteTextScale",
            value: state.whiteTextScale,
            template: "editoriale",
            min: 80,
            max: 190,
          })}
          ${renderRangeField({
            label: "Size Scritta Gialla",
            path: "yellowTextScale",
            value: state.yellowTextScale,
            template: "editoriale",
            min: 80,
            max: 190,
          })}
        </div>

        <div class="field-grid">
          ${renderRangeField({
            label: "Posizione Bianca",
            path: "whiteTextOffsetY",
            value: state.whiteTextOffsetY ?? 0,
            template: "editoriale",
            min: -120,
            max: 120,
          })}
          ${renderRangeField({
            label: "Posizione Gialla",
            path: "yellowTextOffsetY",
            value: state.yellowTextOffsetY ?? 0,
            template: "editoriale",
            min: -120,
            max: 120,
          })}
        </div>

        ${renderRangeField({
          label: "Sfumatura Sinistra",
          path: "leftGradient",
          value: state.leftGradient,
          template: "editoriale",
          min: 0,
          max: 100,
        })}

        <div class="field">
          <div class="field-label-row">
            <span class="field-label">Colori Testo Editoriale</span>
            <span class="field-value">Bianco e giallo gestibili separatamente</span>
          </div>
          <div class="color-grid">
            ${EDITORIAL_COLOR_FIELDS.map((field) => renderColorField("editoriale", state, field)).join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderPrematchAdjustmentCard(title, sideState, teamKey) {
  return `
    <div class="mini-card">
      <h3 class="mini-card-title">${title}</h3>
      <div class="fields">
        ${renderRangeField({
          label: "Size",
          path: `transforms.${teamKey}.size`,
          value: sideState.size,
          template: "prematch",
          min: 40,
          max: 240,
        })}
        ${renderRangeField({
          label: "Offset X",
          path: `transforms.${teamKey}.offsetX`,
          value: sideState.offsetX,
          template: "prematch",
          min: -100,
          max: 100,
        })}
        ${renderRangeField({
          label: "Offset Y",
          path: `transforms.${teamKey}.offsetY`,
          value: sideState.offsetY,
          template: "prematch",
          min: -100,
          max: 100,
        })}
      </div>
    </div>
  `;
}

function renderEditorialFlagPanel(state) {
  if (state.background !== "chiamata vuota.jpg") {
    return "";
  }

  return `
    <aside class="preview-sidepanel">
      <div class="preview-sidepanel-header">
        <h3 class="preview-sidepanel-title">Chiamata Vuota</h3>
        <p class="preview-sidepanel-copy">Scegli se costruire la cover con bandiera o con pitch.</p>
      </div>

      <div class="fields">
        ${renderSelectField({
          label: "Modalita",
          path: "chiamataVuotaMode",
          value: state.chiamataVuotaMode,
          template: "editoriale",
          options: CHIAMATA_VUOTA_MODE_OPTIONS,
        })}

        ${
          state.chiamataVuotaMode === "pitch"
            ? `
                ${renderSelectField({
                  label: "Modulo",
                  path: "pitchFormation",
                  value: state.pitchFormation,
                  template: "editoriale",
                  options: PITCH_FORMATION_OPTIONS,
                })}

                ${renderTextareaField({
                  label: "Giocatori (uno per riga)",
                  path: "pitchPlayers",
                  value: state.pitchPlayers,
                  template: "editoriale",
                })}

                <div class="field-grid field-grid-two">
                  ${renderRangeField({
                    label: "Blur Pitch",
                    path: "pitchBlur",
                    value: state.pitchBlur,
                    template: "editoriale",
                    min: 0,
                    max: 100,
                  })}
                  ${renderRangeField({
                    label: "Size Pitch",
                    path: "pitchScale",
                    value: state.pitchScale,
                    template: "editoriale",
                    min: 60,
                    max: 150,
                  })}
                </div>

                <div class="field-grid field-grid-two">
                  ${renderRangeField({
                    label: "Offset X Pitch",
                    path: "pitchOffsetX",
                    value: state.pitchOffsetX,
                    template: "editoriale",
                    min: -200,
                    max: 200,
                  })}
                  ${renderRangeField({
                    label: "Offset Y Pitch",
                    path: "pitchOffsetY",
                    value: state.pitchOffsetY,
                    template: "editoriale",
                    min: -200,
                    max: 200,
                  })}
                </div>

                <div class="field-grid field-grid-two">
                  ${renderRangeField({
                    label: "Size Nomi",
                    path: "pitchNameSize",
                    value: state.pitchNameSize,
                    template: "editoriale",
                    min: 10,
                    max: 30,
                  })}
                  ${renderRangeField({
                    label: "Size Pallini",
                    path: "pitchDotSize",
                    value: state.pitchDotSize,
                    template: "editoriale",
                    min: 4,
                    max: 20,
                  })}
                </div>

                <div class="field-grid field-grid-two">
                  ${renderSelectField({
                    label: "Stile Pallini",
                    path: "pitchDotStyle",
                    value: state.pitchDotStyle,
                    template: "editoriale",
                    options: PITCH_DOT_STYLE_OPTIONS,
                  })}

                  <div class="field">
                    <div class="field-label-row">
                      <span class="field-label">Colore Pallini</span>
                    </div>
                    <div class="color-grid">
                      ${renderColorField("editoriale", state, { label: "Pallini", path: "pitchDotColor" })}
                    </div>
                  </div>
                </div>
              `
            : `
        ${renderAssetSelectField({
          label: "Bandiera",
          path: "flagAsset",
          value: state.flagAsset,
          template: "editoriale",
          options: EDITORIAL_FLAG_OPTIONS,
          emptyOptionLabel: "Nessuna",
          searchPlaceholder: "Cerca bandiera",
        })}
        ${renderRangeField({
          label: "Size Bandiera",
          path: "flagScale",
          value: state.flagScale,
          template: "editoriale",
          min: 50,
          max: 160,
        })}
        ${renderRangeField({
          label: "Offset X Bandiera",
          path: "flagOffsetX",
          value: state.flagOffsetX,
          template: "editoriale",
          min: -180,
          max: 180,
        })}
        ${renderRangeField({
          label: "Offset Y Bandiera",
          path: "flagOffsetY",
          value: state.flagOffsetY,
          template: "editoriale",
          min: -180,
          max: 180,
        })}
              `
        }
      </div>
    </aside>
  `;
}

function renderPreviewExtras(appState) {
  if (appState.activeTemplate !== "prematch") {
    return `
      <div class="status-bar">
        <span><strong>Background base:</strong> JPG editoriale selezionato</span>
        <span><strong>Testo:</strong> sovrapposto sopra il background</span>
      </div>
    `;
  }

  return `
    <div class="mini-card-grid">
      ${renderPrematchAdjustmentCard("TEAM A", appState.prematch.transforms.teamA, "teamA")}
      ${renderPrematchAdjustmentCard("TEAM B", appState.prematch.transforms.teamB, "teamB")}
    </div>
  `;
}

export function renderShell(appState, assetReport) {
  return `
    <div class="app-shell">
      <header class="topbar">
        <div>
          <span class="eyebrow">BETFAIR COVER TOOL</span>
          <h1 class="headline">Generatore guidato per cover sportive interne</h1>
          <p class="subheadline">Due template separati, preview live sempre visibile e export JPEG a dimensione reale 1200x676.</p>
        </div>

        <div class="template-switcher" role="tablist" aria-label="Selettore template">
          ${Object.values(TEMPLATES)
            .map(
              (template) => `
                <button
                  class="template-tab ${appState.activeTemplate === template.key ? "is-active" : ""}"
                  type="button"
                  data-action="switch-template"
                  data-template-key="${template.key}"
                  role="tab"
                  aria-selected="${appState.activeTemplate === template.key}"
                >
                  ${template.label}
                </button>
              `,
            )
            .join("")}
        </div>
      </header>

      <main class="workspace">
        <section>
          ${appState.activeTemplate === "prematch" ? renderPrematchForm(appState.prematch) : renderEditorialForm(appState.editoriale)}
        </section>

        <section class="preview-stack">
          <div class="preview-card">
            <div class="preview-toolbar">
              <div>
                <h2 class="preview-title">Preview Live</h2>
                <p class="preview-copy">Canvas reale sincronizzato con export JPEG finale.</p>
              </div>
              <div class="status-pill">${assetReport}</div>
            </div>

            <div class="preview-main ${appState.activeTemplate === "editoriale" && appState.editoriale.background === "chiamata vuota.jpg" ? "has-sidepanel" : ""}">
              <div class="cover-frame">
                <canvas
                  id="cover-canvas"
                  class="cover-canvas"
                  width="${COVER_WIDTH}"
                  height="${COVER_HEIGHT}"
                ></canvas>
              </div>

              ${appState.activeTemplate === "editoriale" ? renderEditorialFlagPanel(appState.editoriale) : ""}
            </div>

            <div class="preview-actions">
              <p class="preview-meta">
                Template attivo: <strong>${TEMPLATES[appState.activeTemplate].label}</strong><br />
                Export finale: <strong>${COVER_WIDTH}x${COVER_HEIGHT}</strong>
              </p>
              <button class="download-button" type="button" data-action="download-jpeg">SCARICA JPEG</button>
            </div>
          </div>

          ${renderPreviewExtras(appState)}
        </section>
      </main>
    </div>
  `;
}

export function renderLoadingScreen() {
  return `
    <div class="loading-state">
      <div class="loading-card">
        <span class="eyebrow">BETFAIR COVER TOOL</span>
        <h1>Sto preparando asset, font e canvas</h1>
        <p>Il tool carica i background ufficiali, registra i font locali e inizializza la preview esportabile a 1200x676.</p>
      </div>
    </div>
  `;
}
