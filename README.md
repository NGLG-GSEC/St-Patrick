# Masonic Order of Saint Patrick Website

This is a buildless static website. Open `index.html` directly or serve the repository root with any static host.

## Structure

- `index.html` contains the page structure.
- `styles.css` contains the visual system.
- `app.js` contains the lodge roll, officers, honours, news, gallery and browser content builder.
- `assets/` contains the supplied images and extracted seal artwork.

## Updating content

Use the Builder section on the page to add:

- news items
- lodges
- officers
- gallery records

Then export the JSON and keep it with the site files. A future version can import that JSON back into the builder.

## Education section and 3D path

- `path3d.js` renders the interactive 3D path of the Allied Masonic Degrees (three.js, vendored in `assets/vendor/three`, loaded through an import map in `index.html`). The jewels are original geometry built from the written jewel descriptions.
- `assets/amd/` holds the AMD France degrees chart and the 2022 Charter, rendered from the supplied PDFs.
- If WebGL is unavailable the page falls back to the step-by-step text panel.

## Languages

The site is available in English, French, Greek, Spanish and Brazilian Portuguese. The flag at the top right of the header switches language and the choice is remembered (`?lang=fr` also works).

- English in `index.html`, `app.js` and `path-data.js` is the source text.
- `i18n-data.js` holds the translations, keyed by the exact English string, so any string without a translation simply stays in English.
- Offices, bodies, degrees and other technical Masonic terms are given in the local language with the standard English term beside them in brackets.
- New English text added to the site needs a matching entry in `i18n-data.js` for each language.
- Translations should be reviewed by native Masonic speakers of each jurisdiction before wider use.
