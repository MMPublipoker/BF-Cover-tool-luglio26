# Betfair Cover Tool

Tool web interno per generare cover sportive Betfair con due template separati:

- `Prematch`
- `Editoriale`

La preview live e l'export JPEG usano lo stesso canvas reale a `1200x676`, così il risultato finale resta coerente con ciò che si vede in interfaccia.

## Avvio locale

Poiché il progetto è costruito come web app statica senza build obbligatoria, è sufficiente avviare un server locale nella cartella:

```bash
python3 -m http.server 4173
```

Poi apri:

```text
http://127.0.0.1:4173
```

## Struttura

- `index.html`: entrypoint dell'app
- `styles.css`: UI dark theme Betfair
- `src/config.js`: default values, asset config, font config, colori e template metadata
- `src/prematchAssets.generated.js`: manifest generata dei cutout Prematch reali
- `src/fontLoader.js`: registrazione dei font locali via `FontFace`
- `src/renderers.js`: rendering canvas, preview/export JPEG e preload asset
- `src/ui.js`: markup delle sezioni UI e dei controlli
- `src/app.js`: stato globale, binding eventi e sincronizzazione preview
- `assets/backgrounds`: background ufficiali reali forniti
- `assets/fonts`: font ufficiali forniti
- `assets/prematch-real/with-ball`: cutout reali Prematch con pallone
- `assets/prematch-real/without-ball`: cutout reali Prematch senza pallone
- `assets/prematch-teams`: placeholder sostituibili per team overlay
- `assets/editorial-subjects`: placeholder sostituibili per soggetti editoriali

## Note operative

- I background ufficiali vengono usati davvero sia in preview sia nell'export.
- I font locali vengono caricati realmente e usati sia per UI sia per canvas.
- Il Prematch usa select reali raggruppate `Con pallone` e `Senza pallone` alimentate dalla manifest generata.
- Gli asset vengono caricati in cache solo quando servono, per evitare un preload pesante di tutta la libreria Prematch.
