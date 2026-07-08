export interface AssetOption {
  label: string;
  src: string;
}

export interface TeamTransform {
  size: number;
  offsetX: number;
  offsetY: number;
}

export interface PrematchTextColors {
  teamA: string;
  centerX: string;
  teamB: string;
  competitionA: string;
  competitionB: string;
  teamAOdds: string;
  drawOdds: string;
  teamBOdds: string;
  eventCopy: string;
}

export interface EditorialTextColors {
  whiteText: string;
  yellowText: string;
}

export interface PrematchState {
  teamA: string;
  xLabel: string;
  teamB: string;
  competitionA: string;
  competitionB: string;
  oddsA: string;
  oddsDraw: string;
  oddsB: string;
  eventCopy: string;
  teamAAsset: string;
  teamBAsset: string;
  textColors: PrematchTextColors;
  transforms: {
    teamA: TeamTransform;
    teamB: TeamTransform;
  };
}

export interface EditorialState {
  whiteText: string;
  yellowText: string;
  background: string;
  chiamataVuotaMode: string;
  flagAsset: string;
  flagScale: number;
  flagOffsetX: number;
  flagOffsetY: number;
  pitchFormation: string;
  pitchPlayers: string;
  pitchBlur: number;
  pitchScale: number;
  pitchOffsetX: number;
  pitchOffsetY: number;
  pitchNameSize: number;
  pitchDotSize: number;
  pitchDotStyle: string;
  pitchDotColor: string;
  whiteTextScale: number;
  yellowTextScale: number;
  whiteTextOffsetY: number;
  yellowTextOffsetY: number;
  leftGradient: number;
  textColors: EditorialTextColors;
}

export interface AppState {
  activeTemplate: "prematch" | "editoriale";
  prematch: PrematchState;
  editoriale: EditorialState;
}
