import { EDITORIAL_FLAG_OPTIONS } from "./editorialFlags.generated.js";
import { PREMATCH_ASSET_GROUPS } from "./prematchAssets.generated.js";

export const COVER_WIDTH = 1200;
export const COVER_HEIGHT = 676;

export const TEMPLATES = {
  prematch: {
    key: "prematch",
    label: "Prematch",
    title: "Template Prematch",
    subtitle:
      "Compila solo i campi del template prematch. I controlli di size e posizione sono sotto l'anteprima.",
  },
  editoriale: {
    key: "editoriale",
    label: "Editoriale",
    title: "Template Editoriale",
    subtitle:
      "Scegli uno dei background editoriali disponibili e regola la dimensione del testo sopra la cover.",
  },
};

export const BRAND = {
  yellow: "#FFB80C",
  white: "#FFFFFF",
  black: "#0D0D0D",
};

export const CHIAMATA_VUOTA_MODE_OPTIONS = [
  { value: "flag", label: "Bandiera" },
  { value: "pitch", label: "Pitch" },
];

export const PITCH_FORMATION_OPTIONS = [
  { value: "4-3-3", label: "4-3-3" },
  { value: "3-5-2", label: "3-5-2" },
  { value: "4-2-3-1", label: "4-2-3-1" },
  { value: "3-4-2-1", label: "3-4-2-1" },
];

export const PITCH_DOT_STYLE_OPTIONS = [
  { value: "filled", label: "Pieno" },
  { value: "ring", label: "Anello" },
  { value: "outlined", label: "Pieno + bordo" },
];

export const PITCH_FORMATION_DEFAULT_PLAYERS = {
  "4-3-3": [
    "PORTIERE",
    "TERZINO DX",
    "CENTRALE DX",
    "CENTRALE SX",
    "TERZINO SX",
    "MEDIANO",
    "MEZZALA DX",
    "MEZZALA SX",
    "ALA DX",
    "PUNTA",
    "ALA SX",
  ],
  "3-5-2": [
    "PORTIERE",
    "BRACCETTO DX",
    "CENTRALE",
    "BRACCETTO SX",
    "ESTERNO DX",
    "INTERNO DX",
    "MEDIANO",
    "INTERNO SX",
    "ESTERNO SX",
    "ATTACCANTE 1",
    "ATTACCANTE 2",
  ],
  "4-2-3-1": [
    "PORTIERE",
    "TERZINO DX",
    "CENTRALE DX",
    "CENTRALE SX",
    "TERZINO SX",
    "MEDIANO DX",
    "MEDIANO SX",
    "TREQ DX",
    "TREQ CENTRALE",
    "TREQ SX",
    "PUNTA",
  ],
  "3-4-2-1": [
    "PORTIERE",
    "BRACCETTO DX",
    "CENTRALE",
    "BRACCETTO SX",
    "ESTERNO DX",
    "CENTROCAMPISTA DX",
    "CENTROCAMPISTA SX",
    "ESTERNO SX",
    "TREQ DX",
    "TREQ SX",
    "PUNTA",
  ],
};

export function getPitchPlayersTemplate(formation) {
  return (PITCH_FORMATION_DEFAULT_PLAYERS[formation] ?? []).join("\n");
}

export const FONT_DEFINITIONS = [
  {
    family: "Betfair Condensed",
    src: "./assets/fonts/NotoSans_Condensed-Bold.ttf",
    weight: "700",
  },
  {
    family: "Betfair Condensed Black",
    src: "./assets/fonts/NotoSans_Condensed-Black.ttf",
    weight: "900",
  },
  {
    family: "Betfair ExtraBold",
    src: "./assets/fonts/NotoSans-ExtraBold.ttf",
    weight: "800",
  },
  {
    family: "Betfair Light",
    src: "./assets/fonts/NotoSans-Light.ttf",
    weight: "300",
  },
];

const prematchFlatAssets = PREMATCH_ASSET_GROUPS.flatMap((group) => group.options);

export const PREMATCH_BACKGROUND_OPTIONS = [
  { value: "prematch-official.jpg", label: "Ufficiale", src: "./assets/backgrounds/prematch-official.jpg" },
  { value: "prematch-giallo.jpg", label: "Giallo", src: "./assets/backgrounds/prematch-giallo.jpg" },
];

export const PREMATCH_YELLOW_BACKGROUND = "prematch-giallo.jpg";
export const PREMATCH_YELLOW_TEXT_FIELDS = ["teamA", "teamB", "teamAOdds", "drawOdds", "teamBOdds"];

export const EDITORIAL_BACKGROUND_OPTIONS = [
  { value: "uomo serio.jpg", label: "Uomo Serio", src: "./assets/editorial-backgrounds/uomo serio.jpg" },
  { value: "uomo dubbioso.jpg", label: "Uomo Dubbioso", src: "./assets/editorial-backgrounds/uomo dubbioso.jpg" },
  { value: "persone telefono.jpg", label: "Persone Telefono", src: "./assets/editorial-backgrounds/persone telefono.jpg" },
  { value: "calciatore disperato.jpg", label: "Calciatore Disperato", src: "./assets/editorial-backgrounds/calciatore disperato.jpg" },
  { value: "uomo telefono.jpg", label: "Uomo Telefono", src: "./assets/editorial-backgrounds/uomo telefono.jpg" },
  { value: "tennista uomo.jpg", label: "Tennista Uomo", src: "./assets/editorial-backgrounds/tennista uomo.jpg" },
  { value: "tennista donna.jpg", label: "Tennista Donna", src: "./assets/editorial-backgrounds/tennista donna.jpg" },
  { value: "tennista donna 2.jpg", label: "Tennista Donna 2", src: "./assets/editorial-backgrounds/tennista donna 2.jpg" },
  { value: "pilota f1 small.jpg", label: "Pilota F1 Small", src: "./assets/editorial-backgrounds/pilota f1 small.jpg" },
  { value: "pilota f1 big.jpg", label: "Pilota F1 Big", src: "./assets/editorial-backgrounds/pilota f1 big.jpg" },
  { value: "pilota moto.jpg", label: "Pilota Moto", src: "./assets/editorial-backgrounds/pilota moto.jpg" },
  { value: "persone generiche.jpg", label: "Persone Generiche", src: "./assets/editorial-backgrounds/persone generiche.jpg" },
  { value: "scarpe spagna.jpg", label: "Scarpe Spagna", src: "./assets/editorial-backgrounds/scarpe spagna.jpg" },
  { value: "scarpe pallone.jpg", label: "Scarpe Pallone", src: "./assets/editorial-backgrounds/scarpe pallone.jpg" },
  { value: "scarpe italia.jpg", label: "Scarpe Italia", src: "./assets/editorial-backgrounds/scarpe italia.jpg" },
  { value: "italia nazionale.jpg", label: "Italia Nazionale", src: "./assets/editorial-backgrounds/italia nazionale.jpg" },
  { value: "multisport.jpg", label: "Multisport", src: "./assets/editorial-backgrounds/multisport.jpg" },
  { value: "macchina f1.jpg", label: "Macchina F1", src: "./assets/editorial-backgrounds/macchina f1.jpg" },
  { value: "infortunio calciatore.jpg", label: "Infortunio Calciatore", src: "./assets/editorial-backgrounds/infortunio calciatore.jpg" },
  { value: "grafico su.jpg", label: "Grafico Su", src: "./assets/editorial-backgrounds/grafico su.jpg" },
  { value: "calciatore azione.jpg", label: "Calciatore Azione", src: "./assets/editorial-backgrounds/calciatore azione.jpg" },
  { value: "calciatore dorato.jpg", label: "Calciatore Dorato", src: "./assets/editorial-backgrounds/calciatore dorato.jpg" },
  { value: "calciatore coppa.jpg", label: "Calciatore Coppa", src: "./assets/editorial-backgrounds/calciatore coppa.jpg" },
  { value: "pallone+coppa.jpg", label: "Pallone + Coppa", src: "./assets/editorial-backgrounds/pallone+coppa.jpg" },
  { value: "chiamata vuota.jpg", label: "Chiamata Vuota", src: "./assets/editorial-backgrounds/chiamata vuota.jpg" },
  { value: "frecce betfair.jpg", label: "Frecce Betfair", src: "./assets/editorial-backgrounds/frecce betfair.jpg" },
  { value: "esultanza calciatore.jpg", label: "Esultanza Calciatore", src: "./assets/editorial-backgrounds/esultanza calciatore.jpg" },
  { value: "coppa del mondo.jpg", label: "Coppa Del Mondo", src: "./assets/editorial-backgrounds/coppa del mondo.jpg" },
  { value: "ciclista.jpg", label: "Ciclista", src: "./assets/editorial-backgrounds/ciclista.jpg" },
  { value: "cartellino giallo.jpg", label: "Cartellino Giallo", src: "./assets/editorial-backgrounds/cartellino giallo.jpg" },
  { value: "cartellino rosso.jpg", label: "Cartellino Rosso", src: "./assets/editorial-backgrounds/cartellino rosso.jpg" },
  { value: "contrasto calcio.jpg", label: "Contrasto Calcio", src: "./assets/editorial-backgrounds/contrasto calcio.jpg" },
  { value: "calciatrice bianca.jpg", label: "Calciatrice Bianca", src: "./assets/editorial-backgrounds/calciatrice bianca.jpg" },
  { value: "calciatrice nera.jpg", label: "Calciatrice Nera", src: "./assets/editorial-backgrounds/calciatrice nera.jpg" },
  { value: "calciatore bianco pallone.jpg", label: "Calciatore Bianco Pallone", src: "./assets/editorial-backgrounds/calciatore bianco pallone.jpg" },
  { value: "basket giocatore nero1.jpg", label: "Basket Giocatore Nero 1", src: "./assets/editorial-backgrounds/basket giocatore nero1.jpg" },
  { value: "basket giocatore bianco 2.jpg", label: "Basket Giocatore Bianco 2", src: "./assets/editorial-backgrounds/basket giocatore bianco 2.jpg" },
  { value: "basket giocatore bianco1.jpg", label: "Basket Giocatore Bianco 1", src: "./assets/editorial-backgrounds/basket giocatore bianco1.jpg" },
  { value: "basket giocatrice1.jpg", label: "Basket Giocatrice 1", src: "./assets/editorial-backgrounds/basket giocatrice1.jpg" },
  { value: "arbitro var.jpg", label: "Arbitro VAR", src: "./assets/editorial-backgrounds/arbitro var.jpg" },
  { value: "arbitro fischio.jpg", label: "Arbitro Fischio", src: "./assets/editorial-backgrounds/arbitro fischio.jpg" },
  { value: "allenatore.jpg", label: "Allenatore", src: "./assets/editorial-backgrounds/allenatore.jpg" },
  { value: "var.jpg", label: "VAR", src: "./assets/editorial-backgrounds/var.jpg" },
];

const prematchBackgroundAssets = Object.fromEntries(
  PREMATCH_BACKGROUND_OPTIONS.map((asset) => [asset.value, asset]),
);
const editorialBackgroundAssets = Object.fromEntries(
  EDITORIAL_BACKGROUND_OPTIONS.map((asset) => [asset.value, asset]),
);
const editorialFlagAssets = Object.fromEntries(
  EDITORIAL_FLAG_OPTIONS.map((asset) => [asset.value, asset]),
);
export const ASSETS = {
  backgrounds: {
    prematch: "./assets/backgrounds/prematch-official.jpg",
    editoriale: "./assets/backgrounds/editoriale-official.jpg",
  },
  editorialPitch: "./assets/editorial-pitch/pitch.png",
  prematchTeamAssets: Object.fromEntries(
    prematchFlatAssets.map((asset) => [asset.value, asset]),
  ),
  prematchBackgrounds: prematchBackgroundAssets,
  editorialBackgrounds: editorialBackgroundAssets,
  editorialFlags: editorialFlagAssets,
};

export const PREMATCH_ASSET_OPTIONS = PREMATCH_ASSET_GROUPS;
export { EDITORIAL_FLAG_OPTIONS };

export const FALLBACKS = {
  prematchBackground: {
    fill: "#111111",
    accent: "#FFB80C",
  },
  editorialBackground: {
    fill: "#111111",
    accent: "#FFFFFF",
  },
};

export const DEFAULT_PREMATCH_STATE = {
  teamA: "Lecce",
  xLabel: "X",
  teamB: "Fiorentina",
  competitionA: "LEC",
  competitionB: "FIO",
  oddsA: "3.25",
  oddsDraw: "3.25",
  oddsB: "2.10",
  eventCopy: "SERIE A | GIORNATA 33 | LUNEDÌ 20 - 20:45",
  background: "prematch-official.jpg",
  teamAAsset: "with-ball::lecce pallone.png",
  teamBAsset: "without-ball::fiorentina.png",
  textColors: {
    teamA: "#FFB80C",
    centerX: "#FFFFFF",
    teamB: "#FFB80C",
    competitionA: "#FFFFFF",
    competitionB: "#FFFFFF",
    teamAOdds: "#FFB80C",
    drawOdds: "#FFB80C",
    teamBOdds: "#FFB80C",
    eventCopy: "#FFFFFF",
  },
  transforms: {
    teamA: {
      size: 156,
      offsetX: -8,
      offsetY: 0,
    },
    teamB: {
      size: 180,
      offsetX: -100,
      offsetY: -15,
    },
  },
};

export const DEFAULT_EDITORIAL_STATE = {
  whiteText: "IL PUNTO SULLA",
  yellowText: "VOLATA CHAMPIONS",
  background: "chiamata vuota.jpg",
  chiamataVuotaMode: "flag",
  flagAsset: "",
  flagScale: 100,
  flagOffsetX: 79,
  flagOffsetY: 45,
  pitchFormation: "4-3-3",
  pitchPlayers: getPitchPlayersTemplate("4-3-3"),
  pitchBlur: 75,
  pitchScale: 100,
  pitchOffsetX: 0,
  pitchOffsetY: 0,
  pitchNameSize: 18,
  pitchDotSize: 9,
  pitchDotStyle: "filled",
  pitchDotColor: "#FFB80C",
  whiteTextScale: 145,
  yellowTextScale: 145,
  whiteTextOffsetY: 0,
  yellowTextOffsetY: 0,
  leftGradient: 0,
  textColors: {
    whiteText: "#FFFFFF",
    yellowText: "#FFB80C",
  },
};

export const EDITORIAL_COLOR_FIELDS = [
  { label: "White Text", path: "textColors.whiteText" },
  { label: "Yellow Text", path: "textColors.yellowText" },
];

export function createInitialState() {
  return {
    activeTemplate: "prematch",
    prematch: structuredClone(DEFAULT_PREMATCH_STATE),
    editoriale: structuredClone(DEFAULT_EDITORIAL_STATE),
  };
}
