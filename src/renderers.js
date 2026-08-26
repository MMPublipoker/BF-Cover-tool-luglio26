import { ASSETS, COVER_HEIGHT, COVER_WIDTH, FALLBACKS, getPitchPlayersTemplate } from "./config.js";

const PITCH_FORMATION_LAYOUTS = {
  "4-3-3": [
    { x: 0.5, y: 0.9 },
    { x: 0.18, y: 0.72 },
    { x: 0.38, y: 0.74 },
    { x: 0.62, y: 0.74 },
    { x: 0.82, y: 0.72 },
    { x: 0.5, y: 0.58 },
    { x: 0.32, y: 0.52 },
    { x: 0.68, y: 0.52 },
    { x: 0.18, y: 0.3 },
    { x: 0.5, y: 0.24 },
    { x: 0.82, y: 0.3 },
  ],
  "3-5-2": [
    { x: 0.5, y: 0.9 },
    { x: 0.24, y: 0.74 },
    { x: 0.5, y: 0.76 },
    { x: 0.76, y: 0.74 },
    { x: 0.12, y: 0.54 },
    { x: 0.3, y: 0.52 },
    { x: 0.5, y: 0.48 },
    { x: 0.7, y: 0.52 },
    { x: 0.88, y: 0.54 },
    { x: 0.38, y: 0.24 },
    { x: 0.62, y: 0.24 },
  ],
  "4-2-3-1": [
    { x: 0.5, y: 0.9 },
    { x: 0.18, y: 0.72 },
    { x: 0.38, y: 0.74 },
    { x: 0.62, y: 0.74 },
    { x: 0.82, y: 0.72 },
    { x: 0.38, y: 0.58 },
    { x: 0.62, y: 0.58 },
    { x: 0.18, y: 0.4 },
    { x: 0.5, y: 0.34 },
    { x: 0.82, y: 0.4 },
    { x: 0.5, y: 0.18 },
  ],
  "3-4-2-1": [
    { x: 0.5, y: 0.9 },
    { x: 0.24, y: 0.74 },
    { x: 0.5, y: 0.76 },
    { x: 0.76, y: 0.74 },
    { x: 0.14, y: 0.54 },
    { x: 0.38, y: 0.54 },
    { x: 0.62, y: 0.54 },
    { x: 0.86, y: 0.54 },
    { x: 0.38, y: 0.32 },
    { x: 0.62, y: 0.32 },
    { x: 0.5, y: 0.16 },
  ],
};

export function loadImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => {
      console.warn(`Impossibile caricare l'immagine ${src}`);
      resolve(null);
    };
    image.src = src;
  });
}

export function getStaticResourceEntries() {
  return [
    ["background:prematch", ASSETS.backgrounds.prematch],
    ["background:editoriale", ASSETS.backgrounds.editoriale],
    ["editorial-pitch", ASSETS.editorialPitch],
  ];
}

export function getPrematchResourceEntry(assetKey) {
  const asset = ASSETS.prematchTeamAssets[assetKey];
  if (!asset) {
    return null;
  }

  return [`prematch:${assetKey}`, asset.src];
}

export function getPrematchBackgroundResourceEntry(backgroundKey) {
  const asset = ASSETS.prematchBackgrounds[backgroundKey];
  if (!asset) {
    return null;
  }

  return [`prematch-background:${backgroundKey}`, asset.src];
}

export function getEditorialBackgroundResourceEntry(backgroundKey) {
  const asset = ASSETS.editorialBackgrounds[backgroundKey];
  if (!asset) {
    return null;
  }

  return [`editorial-background:${backgroundKey}`, asset.src];
}

export function getEditorialFlagResourceEntry(flagKey) {
  const asset = ASSETS.editorialFlags?.[flagKey];
  if (!asset) {
    return null;
  }

  return [`editorial-flag:${flagKey}`, asset.src];
}

export async function ensureResources(resources, entries) {
  const missingEntries = entries.filter(([key]) => !resources.has(key));
  if (!missingEntries.length) {
    return resources;
  }

  const loadedEntries = await Promise.all(
    missingEntries.map(async ([key, src]) => [key, await loadImage(src)]),
  );

  loadedEntries.forEach(([key, image]) => {
    resources.set(key, image);
  });

  return resources;
}

function clearCanvas(ctx) {
  ctx.clearRect(0, 0, COVER_WIDTH, COVER_HEIGHT);
}

function drawFallbackBackground(ctx, fallback) {
  const gradient = ctx.createLinearGradient(0, 0, COVER_WIDTH, COVER_HEIGHT);
  gradient.addColorStop(0, fallback.fill);
  gradient.addColorStop(1, "#050505");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, COVER_WIDTH, COVER_HEIGHT);

  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = fallback.accent;
  ctx.beginPath();
  ctx.arc(COVER_WIDTH * 0.88, COVER_HEIGHT * 0.08, 220, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBackgroundImage(ctx, image, fallback) {
  if (!image) {
    drawFallbackBackground(ctx, fallback);
    return;
  }

  const imageRatio = image.width / image.height;
  const canvasRatio = COVER_WIDTH / COVER_HEIGHT;
  let drawWidth = COVER_WIDTH;
  let drawHeight = COVER_HEIGHT;
  let drawX = 0;
  let drawY = 0;

  if (imageRatio > canvasRatio) {
    drawHeight = COVER_HEIGHT;
    drawWidth = drawHeight * imageRatio;
    drawX = (COVER_WIDTH - drawWidth) / 2;
  } else {
    drawWidth = COVER_WIDTH;
    drawHeight = drawWidth / imageRatio;
    drawY = (COVER_HEIGHT - drawHeight) / 2;
  }

  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

function drawOverlayVignette(ctx) {
  const vignette = ctx.createLinearGradient(0, 0, 0, COVER_HEIGHT);
  vignette.addColorStop(0, "rgba(0, 0, 0, 0.08)");
  vignette.addColorStop(0.62, "rgba(0, 0, 0, 0.02)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.26)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, COVER_WIDTH, COVER_HEIGHT);
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function fillRoundedPanel(ctx, x, y, width, height, radius, fillStyle, strokeStyle) {
  roundRect(ctx, x, y, width, height, radius);
  ctx.fillStyle = fillStyle;
  ctx.fill();

  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function measureTrackedText(ctx, text, letterSpacing = 0) {
  if (!text) {
    return 0;
  }

  const characters = [...text];
  return characters.reduce((total, character, index) => {
    const width = ctx.measureText(character).width;
    return total + width + (index === characters.length - 1 ? 0 : letterSpacing);
  }, 0);
}

function drawTrackedText(ctx, text, x, y, options) {
  const {
    color = "#FFFFFF",
    letterSpacing = 0,
    align = "left",
    baseline = "alphabetic",
    shadowBlur = 0,
    shadowColor = "transparent",
    strokeWidth = 0,
    strokeColor = color,
  } = options;

  ctx.save();
  ctx.fillStyle = color;
  ctx.textBaseline = baseline;
  ctx.shadowBlur = shadowBlur;
  ctx.shadowColor = shadowColor;

  const totalWidth = measureTrackedText(ctx, text, letterSpacing);
  let cursorX = x;

  if (align === "center") {
    cursorX = x - totalWidth / 2;
  } else if (align === "right") {
    cursorX = x - totalWidth;
  }

  [...text].forEach((character) => {
    if (strokeWidth > 0) {
      ctx.lineWidth = strokeWidth;
      ctx.strokeStyle = strokeColor;
      ctx.strokeText(character, cursorX, y);
    }
    ctx.fillText(character, cursorX, y);
    cursorX += ctx.measureText(character).width + letterSpacing;
  });

  ctx.restore();
}

function fitFontSize(ctx, text, options) {
  const {
    maxWidth,
    minSize = 22,
    maxSize = 100,
    family = "Betfair Condensed",
    weight = 700,
    letterSpacing = 0,
  } = options;

  let size = maxSize;
  while (size > minSize) {
    ctx.font = `${weight} ${size}px "${family}"`;
    if (measureTrackedText(ctx, text, letterSpacing) <= maxWidth) {
      return size;
    }
    size -= 1;
  }
  return minSize;
}

function fitSharedFontSize(ctx, items, options) {
  const {
    minSize = 22,
    maxSize = 100,
    family = "Betfair Condensed",
    weight = 700,
  } = options;

  let size = maxSize;
  while (size > minSize) {
    const allItemsFit = items.every(({ text, maxWidth, letterSpacing = 0 }) => {
      ctx.font = `${weight} ${size}px "${family}"`;
      return measureTrackedText(ctx, text, letterSpacing) <= maxWidth;
    });

    if (allItemsFit) {
      return size;
    }

    size -= 1;
  }

  return minSize;
}

function wrapParagraph(ctx, paragraph, maxWidth, letterSpacing) {
  const words = paragraph.split(/\s+/).filter(Boolean);
  if (!words.length) {
    return [""];
  }

  const lines = [];
  let currentLine = words.shift() ?? "";

  words.forEach((word) => {
    const testLine = `${currentLine} ${word}`;
    if (measureTrackedText(ctx, testLine, letterSpacing) <= maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });

  lines.push(currentLine);
  return lines;
}

function wrapText(ctx, text, maxWidth, letterSpacing = 0) {
  return text
    .split("\n")
    .flatMap((paragraph) => wrapParagraph(ctx, paragraph.trim(), maxWidth, letterSpacing));
}

function drawLines(ctx, lines, x, startY, lineHeight, options) {
  lines.forEach((line, index) => {
    drawTrackedText(ctx, line, x, startY + index * lineHeight, options);
  });
}

export function getPrematchSubjectLayout(side, transform, assetMeta, image) {
  const variant = assetMeta?.variant ?? "Senza pallone";
  let base;

  if (side === "left" && variant === "Con pallone") {
    base = { x: -82, y: 62, height: 620, movementX: 180, movementY: 180 };
  } else if (side === "left") {
    base = { x: -58, y: 92, height: 590, movementX: 180, movementY: 180 };
  } else if (variant === "Con pallone") {
    base = { x: 954, y: 130, height: 500, movementX: 220, movementY: 170 };
  } else {
    base = { x: 860, y: 94, height: 560, movementX: 225, movementY: 170 };
  }

  const scale = transform.size / 100;
  const height = base.height * scale;
  const width = image ? image.width * (height / image.height) : 0;
  const drawX = base.x + (transform.offsetX / 100) * base.movementX;
  const drawY = base.y + (transform.offsetY / 100) * base.movementY;

  return {
    x: drawX,
    y: drawY,
    width,
    height,
    movementX: base.movementX,
    movementY: base.movementY,
  };
}

function drawPrematchSubject(ctx, image, side, transform, assetMeta) {
  if (!image) {
    return;
  }

  const layout = getPrematchSubjectLayout(side, transform, assetMeta, image);

  ctx.save();
  ctx.shadowBlur = 34;
  ctx.shadowColor = "rgba(0, 0, 0, 0.38)";
  ctx.drawImage(image, layout.x, layout.y, layout.width, layout.height);
  ctx.restore();
}

function drawCenterGlow(ctx) {
  ctx.save();
  const glow = ctx.createRadialGradient(600, 350, 50, 600, 350, 250);
  glow.addColorStop(0, "rgba(255, 184, 12, 0.08)");
  glow.addColorStop(1, "rgba(255, 184, 12, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, COVER_WIDTH, COVER_HEIGHT);
  ctx.restore();
}

function drawBottomFade(ctx) {
  const gradient = ctx.createLinearGradient(0, 420, 0, COVER_HEIGHT);
  gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0.18)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, COVER_WIDTH, COVER_HEIGHT);
}

function measureSegmentLine(ctx, segments, letterSpacing = 0) {
  return segments.reduce((total, segment) => total + measureTrackedText(ctx, segment.text, letterSpacing), 0);
}

function drawSegmentLine(ctx, segments, x, y, options) {
  const {
    align = "center",
    baseline = "middle",
    letterSpacing = 0,
    shadowBlur = 14,
    shadowColor = "rgba(0, 0, 0, 0.38)",
    strokeWidth = 1.1,
  } = options;

  const totalWidth = measureSegmentLine(ctx, segments, letterSpacing);
  let cursorX = x;

  if (align === "center") {
    cursorX = x - totalWidth / 2;
  } else if (align === "right") {
    cursorX = x - totalWidth;
  }

  segments.forEach((segment) => {
    drawTrackedText(ctx, segment.text, cursorX, y, {
      color: segment.color,
      letterSpacing,
      baseline,
      shadowBlur,
      shadowColor,
      strokeWidth,
      strokeColor: segment.color,
    });
    cursorX += measureTrackedText(ctx, segment.text, letterSpacing);
  });
}

function fitPrematchTeamNameSize(ctx, lines, options) {
  const {
    maxWidth,
    maxHeight,
    minSize = 22,
    maxSize = 100,
    family = "Betfair Condensed Black",
    weight = 900,
    lineHeightFactor = 0.84,
    letterSpacingFactor = 0,
  } = options;

  let size = maxSize;
  while (size > minSize) {
    ctx.font = `${weight} ${size}px "${family}"`;
    const letterSpacing = size * letterSpacingFactor;
    const widestLine = Math.max(...lines.map((line) => measureSegmentLine(ctx, line, letterSpacing)));
    const totalHeight = lines.length * size * lineHeightFactor;

    if (widestLine <= maxWidth && totalHeight <= maxHeight) {
      return size;
    }

    size -= 1;
  }

  return minSize;
}

function drawPrematchTeamNames(ctx, state) {
  const block = {
    x: COVER_WIDTH * 0.3,
    y: COVER_HEIGHT * 0.17,
    width: COVER_WIDTH * 0.4,
    height: COVER_HEIGHT * 0.17,
  };
  const centerX = block.x + block.width / 2;
  const teamA = state.teamA.toUpperCase();
  const centerMark = state.xLabel.toUpperCase();
  const teamB = state.teamB.toUpperCase();
  const family = "Betfair Condensed Black";
  const weight = 900;
  const lineHeightFactor = 0.84;
  const letterSpacingFactor = 0;

  const singleLine = [
    { text: teamA, color: state.textColors.teamA },
    { text: ` ${centerMark} `, color: state.textColors.centerX },
    { text: teamB, color: state.textColors.teamB },
  ];
  const stackedLines = [
    [
      { text: teamA, color: state.textColors.teamA },
      { text: ` ${centerMark}`, color: state.textColors.centerX },
    ],
    [{ text: teamB, color: state.textColors.teamB }],
  ];

  const singleLineSize = fitPrematchTeamNameSize(ctx, [singleLine], {
    maxWidth: block.width,
    maxHeight: block.height,
    minSize: 40,
    maxSize: 82,
    family,
    weight,
    lineHeightFactor,
    letterSpacingFactor,
  });

  const useSingleLine = singleLineSize >= 54;
  const lines = useSingleLine ? [singleLine] : stackedLines;
  const size = useSingleLine
    ? singleLineSize
    : fitPrematchTeamNameSize(ctx, stackedLines, {
        maxWidth: block.width,
        maxHeight: block.height,
        minSize: 40,
        maxSize: 82,
        family,
        weight,
        lineHeightFactor,
        letterSpacingFactor,
      });
  const lineHeight = size * lineHeightFactor;
  const totalHeight = lines.length * lineHeight;
  const startY = block.y + (block.height - totalHeight) / 2 + lineHeight / 2;
  const letterSpacing = size * letterSpacingFactor;

  ctx.font = `${weight} ${size}px "${family}"`;
  lines.forEach((line, index) => {
    drawSegmentLine(ctx, line, centerX, startY + index * lineHeight, {
      align: "center",
      baseline: "middle",
      letterSpacing,
      shadowBlur: 14,
      shadowColor: "rgba(0, 0, 0, 0.38)",
      strokeWidth: 1.1,
    });
  });
}

function drawPrematchOddsBlock(ctx, state) {
  const competitionY = 396;
  const oddsY = 456;
  const columns = [
    {
      sigla: state.competitionA.toUpperCase(),
      odd: state.oddsA,
      siglaColor: state.textColors.competitionA,
      oddColor: state.textColors.teamAOdds,
      x: 425,
    },
    {
      sigla: state.xLabel.toUpperCase(),
      odd: state.oddsDraw,
      siglaColor: state.textColors.centerX,
      oddColor: state.textColors.drawOdds,
      x: 605,
    },
    {
      sigla: state.competitionB.toUpperCase(),
      odd: state.oddsB,
      siglaColor: state.textColors.competitionB,
      oddColor: state.textColors.teamBOdds,
      x: 786,
    },
  ];

  columns.forEach((column) => {
    ctx.font = `900 44px "Betfair Condensed Black"`;
    drawTrackedText(ctx, column.sigla, column.x, competitionY, {
      color: column.siglaColor,
      align: "center",
      letterSpacing: 1.5,
      shadowBlur: 10,
      shadowColor: "rgba(0, 0, 0, 0.28)",
    });

    ctx.font = `900 54px "Betfair Condensed Black"`;
    drawTrackedText(ctx, column.odd, column.x, oddsY, {
      color: column.oddColor,
      align: "center",
      letterSpacing: 0.35,
      shadowBlur: 10,
      shadowColor: "rgba(0, 0, 0, 0.28)",
    });
  });
}

export function drawPrematchCover(ctx, state, resources) {
  clearCanvas(ctx);
  drawBackgroundImage(
    ctx,
    resources.get(`prematch-background:${state.background}`) ?? resources.get("background:prematch"),
    FALLBACKS.prematchBackground,
  );
  drawOverlayVignette(ctx);
  drawCenterGlow(ctx);
  drawBottomFade(ctx);

  drawPrematchSubject(
    ctx,
    resources.get(`prematch:${state.teamAAsset}`),
    "left",
    state.transforms.teamA,
    ASSETS.prematchTeamAssets[state.teamAAsset],
  );
  drawPrematchSubject(
    ctx,
    resources.get(`prematch:${state.teamBAsset}`),
    "right",
    state.transforms.teamB,
    ASSETS.prematchTeamAssets[state.teamBAsset],
  );
  drawPrematchTeamNames(ctx, state);

  const eventCopySize = fitFontSize(ctx, state.eventCopy.toUpperCase(), {
    maxWidth: 640,
    minSize: 14,
    maxSize: 20,
    family: "Betfair Light",
    weight: 300,
    letterSpacing: 1.9,
  });
  ctx.font = `300 ${eventCopySize}px "Betfair Light"`;
  drawTrackedText(ctx, state.eventCopy.toUpperCase(), 600, 290, {
    color: state.textColors.eventCopy,
    letterSpacing: 1.9,
    align: "center",
    shadowBlur: 12,
    shadowColor: "rgba(0, 0, 0, 0.32)",
  });

  drawPrematchOddsBlock(ctx, state);
}

function drawEditorialGradient(ctx, amount) {
  if (amount <= 0) {
    return;
  }

  const intensity = amount / 100;
  const gradient = ctx.createLinearGradient(0, 0, 640, 0);
  gradient.addColorStop(0, `rgba(0, 0, 0, ${0.88 * intensity})`);
  gradient.addColorStop(0.55, `rgba(0, 0, 0, ${0.36 * intensity})`);
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, COVER_WIDTH, COVER_HEIGHT);
}

function drawEditorialFlag(ctx, state, image) {
  if (!image) {
    return;
  }

  const baseBox = {
    x: 648,
    y: 156,
    width: 440,
    height: 264,
  };
  const scale = (state.flagScale ?? 100) / 100;
  const imageRatio = image.width / image.height;
  const boxRatio = baseBox.width / baseBox.height;
  let drawWidth = baseBox.width;
  let drawHeight = baseBox.height;

  if (imageRatio > boxRatio) {
    drawHeight = drawWidth / imageRatio;
  } else {
    drawWidth = drawHeight * imageRatio;
  }

  drawWidth *= scale;
  drawHeight *= scale;

  const drawX = baseBox.x + (baseBox.width - drawWidth) / 2 + (state.flagOffsetX ?? 0);
  const drawY = baseBox.y + (baseBox.height - drawHeight) / 2 + (state.flagOffsetY ?? 0);

  ctx.save();
  ctx.shadowBlur = 22;
  ctx.shadowColor = "rgba(0, 0, 0, 0.30)";
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  ctx.restore();
}

function getPitchPlayerNames(state) {
  const fallback = getPitchPlayersTemplate(state.pitchFormation)
    .split("\n")
    .map((line) => line.trim());
  const provided = String(state.pitchPlayers ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return fallback.map((fallbackName, index) => provided[index] ?? fallbackName);
}

function drawPitchShape(ctx, x, y, width, height) {
  const radius = Math.min(width, height) * 0.06;
  fillRoundedPanel(
    ctx,
    x,
    y,
    width,
    height,
    radius,
    "rgba(24, 90, 48, 0.95)",
    "rgba(255, 255, 255, 0.24)",
  );

  ctx.strokeStyle = "rgba(255, 255, 255, 0.58)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 14, y + 14, width - 28, height - 28);

  const halfY = y + height / 2;
  ctx.beginPath();
  ctx.moveTo(x + 14, halfY);
  ctx.lineTo(x + width - 14, halfY);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x + width / 2, halfY, Math.min(width, height) * 0.12, 0, Math.PI * 2);
  ctx.stroke();

  const boxWidth = width * 0.42;
  const smallBoxWidth = width * 0.22;
  const boxHeight = height * 0.18;
  const smallBoxHeight = height * 0.08;

  ctx.strokeRect(x + (width - boxWidth) / 2, y + 14, boxWidth, boxHeight);
  ctx.strokeRect(x + (width - smallBoxWidth) / 2, y + 14, smallBoxWidth, smallBoxHeight);
  ctx.strokeRect(x + (width - boxWidth) / 2, y + height - 14 - boxHeight, boxWidth, boxHeight);
  ctx.strokeRect(x + (width - smallBoxWidth) / 2, y + height - 14 - smallBoxHeight, smallBoxWidth, smallBoxHeight);
}

function getContainLayout(image, box) {
  if (!image?.width || !image?.height) {
    return box;
  }

  const imageRatio = image.width / image.height;
  const boxRatio = box.width / box.height;

  if (imageRatio > boxRatio) {
    const height = box.width / imageRatio;
    return {
      x: box.x,
      y: box.y + (box.height - height) / 2,
      width: box.width,
      height,
    };
  }

  const width = box.height * imageRatio;
  return {
    x: box.x + (box.width - width) / 2,
    y: box.y,
    width,
    height: box.height,
  };
}

function drawEditorialPitch(ctx, state, image) {
  const baseBox = {
    x: 592,
    y: 94,
    width: 500,
    height: 430,
  };
  const scale = (state.pitchScale ?? 100) / 100;
  const box = {
    width: baseBox.width * scale,
    height: baseBox.height * scale,
  };
  box.x = baseBox.x + (baseBox.width - box.width) / 2 + (state.pitchOffsetX ?? 0);
  box.y = baseBox.y + (baseBox.height - box.height) / 2 + (state.pitchOffsetY ?? 0);
  const pitchLayout = getContainLayout(image, box);
  const formation = PITCH_FORMATION_LAYOUTS[state.pitchFormation] ?? PITCH_FORMATION_LAYOUTS["4-3-3"];
  const playerNames = getPitchPlayerNames(state);
  const blurAmount = ((state.pitchBlur ?? 75) / 100) * 12;
  const dotSize = state.pitchDotSize ?? 9;
  const nameSize = state.pitchNameSize ?? 18;
  const dotColor = state.pitchDotColor ?? "#FFB80C";
  const dotStyle = state.pitchDotStyle ?? "filled";

  ctx.save();
  ctx.filter = blurAmount > 0 ? `blur(${blurAmount}px)` : "none";
  ctx.globalAlpha = 0.92;

  if (image) {
    ctx.drawImage(image, pitchLayout.x, pitchLayout.y, pitchLayout.width, pitchLayout.height);
  } else {
    drawPitchShape(ctx, box.x, box.y, box.width, box.height);
  }

  formation.forEach((position, index) => {
    const px = pitchLayout.x + position.x * pitchLayout.width;
    const py = pitchLayout.y + position.y * pitchLayout.height;

    if (dotStyle === "ring") {
      ctx.lineWidth = Math.max(2, dotSize * 0.35);
      ctx.strokeStyle = dotColor;
      ctx.beginPath();
      ctx.arc(px, py, dotSize, 0, Math.PI * 2);
      ctx.stroke();
    } else if (dotStyle === "outlined") {
      ctx.fillStyle = dotColor;
      ctx.beginPath();
      ctx.arc(px, py, dotSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = Math.max(1.5, dotSize * 0.2);
      ctx.strokeStyle = "#FFFFFF";
      ctx.stroke();
    } else {
      ctx.fillStyle = dotColor;
      ctx.beginPath();
      ctx.arc(px, py, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.font = `900 ${nameSize}px "Betfair Condensed"`;
    drawTrackedText(ctx, playerNames[index] ?? "", px, py - (dotSize + 8), {
      color: "#FFFFFF",
      align: "center",
      baseline: "bottom",
      letterSpacing: 0.4,
      shadowBlur: 8,
      shadowColor: "rgba(0, 0, 0, 0.28)",
    });
  });

  ctx.restore();
}

export function drawEditorialCover(ctx, state, resources) {
  clearCanvas(ctx);
  drawBackgroundImage(
    ctx,
    resources.get(`editorial-background:${state.background}`) ??
      resources.get("background:editoriale"),
    FALLBACKS.editorialBackground,
  );
  drawOverlayVignette(ctx);
  drawEditorialGradient(ctx, state.leftGradient);

  if (state.background === "chiamata vuota.jpg") {
    if (state.chiamataVuotaMode === "pitch") {
      drawEditorialPitch(ctx, state, resources.get("editorial-pitch"));
    } else if (state.flagAsset) {
      drawEditorialFlag(ctx, state, resources.get(`editorial-flag:${state.flagAsset}`));
    }
  }

  const whiteScale = state.whiteTextScale / 100;
  const yellowScale = state.yellowTextScale / 100;
  const whiteSize = 52 * whiteScale;
  const yellowSize = 70 * yellowScale;
  const whiteOffsetY = state.whiteTextOffsetY ?? 0;
  const yellowOffsetY = state.yellowTextOffsetY ?? 0;
  const textX = 78;
  const textWidth = 468;

  ctx.font = `900 ${whiteSize}px "Betfair Condensed Black"`;
  const whiteLines = wrapText(ctx, state.whiteText.toUpperCase(), textWidth, 1.4);
  const whiteLineHeight = whiteSize * 0.9;
  const whiteStartY = 300 + whiteOffsetY;

  drawLines(ctx, whiteLines, textX, whiteStartY, whiteLineHeight, {
    color: state.textColors.whiteText,
    letterSpacing: 1.4,
    shadowBlur: 16,
    shadowColor: "rgba(0, 0, 0, 0.34)",
  });

  ctx.font = `900 ${yellowSize}px "Betfair Condensed Black"`;
  const yellowLines = wrapText(ctx, state.yellowText.toUpperCase(), textWidth, 1.8);
  const yellowLineHeight = yellowSize * 0.88;
  const yellowStartY = whiteStartY + whiteLines.length * whiteLineHeight + 26 + yellowOffsetY;

  drawLines(ctx, yellowLines, textX, yellowStartY, yellowLineHeight, {
    color: state.textColors.yellowText,
    letterSpacing: 1.8,
    shadowBlur: 18,
    shadowColor: "rgba(0, 0, 0, 0.36)",
  });
}

export function renderActiveCover(ctx, appState, resources) {
  if (appState.activeTemplate === "prematch") {
    drawPrematchCover(ctx, appState.prematch, resources);
    return;
  }

  drawEditorialCover(ctx, appState.editoriale, resources);
}

export function exportCanvasAsJpeg(canvas, filename) {
  canvas.toBlob(
    (blob) => {
      if (!blob) {
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
    "image/jpeg",
    0.95,
  );
}

export function getReadyAssetReport(resources) {
  return `${Array.from(resources.values()).filter(Boolean).length} asset in cache`;
}

export { COVER_WIDTH, COVER_HEIGHT };
