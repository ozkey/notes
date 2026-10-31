# AI Notes/Articles Authoring Contract

This folder is written by an external AI and then merged by:

- `packages/ui/scripts/combine-ai-notes.js`

If you follow this file, output will be compatible with the app/editor and combine script.

Important distinction:

- **MUST** = required for reliable behavior.
- **SHOULD** = strongly recommended for compatibility/maintenance.
- Some MUST rules are hard-validated by `combine-ai-notes.js`.
- Other MUST/SHOULD rules are app/editor compatibility requirements (not enforced by combine).

## 1) Where to write files

- Bible chapter notes: `packages/ui/src/public/notes/ai/notes/*.json`
- Articles: `packages/ui/src/public/notes/ai/articles/*.json`
- Valid book list: `packages/ui/src/public/notes/ai/books.json`

Only write `.json` files directly in `notes` and `articles` (no subfolders).

## 2) Required JSON shapes (app/editor contract; not combine-validated)

### Note file shape

```json
{
  "book": "Genesis",
  "chapterNumber": 1,
  "text": "<p>...</p>",
  "highlights": [
    { "verse": 5, "color": "blue" }
  ]
}
```

- `book` (**MUST**): must resolve to a book from `books.json` (case-insensitive; spaces, `_`, and `-` normalized; leading Roman/Arabic number style is interchangeable, e.g. `i samuel` / `1 samuel`).
- `chapterNumber` (**MUST**): positive integer.
- `text` (**MUST**): HTML string.
- `highlights` (optional): array of `{ verse: number, color: "green"|"blue"|"pink"|"red"|"orange"|"purple" }`.

### Article file shape

```json
{
  "id": "mary",
  "text": "<p>...</p>"
}
```

- `id` (**MUST**): article id used in links. **SHOULD** be lowercase + hyphen (`mary`, `fruit-of-spirit`).
- `text` (**MUST**): HTML string.

## 3) Note filename rules (required for combine)

Each note filename must be:

`<book-token>-<chapter>.json`

Examples:

- `genesis-1.json`
- `song-of-solomon-2.json`
- `i-samuel-3.json`
- `1-samuel-3.json` (also accepted)

Important:

- Final segment **MUST** be the chapter number.
- Do **not** add suffixes like `-2` to note filenames (`genesis-1-2.json` fails combine validation).
- `book` in file content **MUST** match the same canonical book as filename token.

## 4) Bible link rules inside note `text` (combine-sensitive)

For Bible links in note HTML, use:

- `href="#Book:Chapter"` or
- `href="#Book:Chapter:Verse"`

Examples:

- `<a href="#Exodus:1">Exodus 1</a>`
- `<a href="#Exodus:1:2">Exodus 1:2</a>`

Rules:

- Book in `href` **MUST** exist in `books.json`.
- Use double quotes in attributes (`href="..."`).
- Book separators in hash can be spaces or `-`/`_` (editor/parser handles these).
- Combine validation behavior is narrow: in note files, it only checks hash links containing `:` and validates the first segment as a known book token.
- Hash links without `:` are treated as article links and validated against article ids.

## 5) Article links inside `text`

To link to an article tab, use:

- `href="#<article-id>"`

Example:

- `<a href="#mary">#mary</a>`

Keep `article-id` normalized (lowercase, hyphenated, no spaces) for best compatibility.
You can use this in article content and in note content.
Combine validates these links in both note and article `text`.

## 6) Allowed HTML (editor-compatible)

Use only editor-supported structures/patterns:

- Paragraphs/line breaks: `<p>`, `<br>`
- Headings: `<h1>`, `<h2>`, `<h3>`
- Emphasis: `<strong>`, `<b>`, `<em>`, `<i>`, `<u>`, `<s>`, `<strike>`
- Lists: `<ul>`, `<ol>`, `<li>`
- Block quotes/alerts:
  - `<blockquote>...</blockquote>`
  - `<blockquote class="editor-alert-info">...</blockquote>`
  - `<blockquote class="editor-alert-warning">...</blockquote>`
  - `<blockquote class="editor-alert-error">...</blockquote>`
- Code: `<pre><code>...</code></pre>`
- Tables (editor format):
  - `<table class="editor-table"><tbody>...<tr><td>...</td></tr>...</tbody></table>`
- Links: `<a href="...">...</a>` (optional `target="_blank"` for external links)
- Highlight badge (editor format):
  - `<span class="editor-highlight-badge" data-color="blue" contenteditable="false">5</span> - `

## 7) HTML to avoid (not editor-safe / not supported format)

Do not generate:

- `<script>`, `<iframe>`, `<object>`, `<embed>`, `<form>`, `<input>`, `<button>`, `<textarea>`
- Inline event handlers (`onclick`, `onerror`, etc.)
- Complex custom widgets/components/classes unknown to editor
- SVG/MathML blocks

The app/export rendering path inserts `text` as HTML. Keep HTML simple, semantic, and in the supported set above.

## 8) Image storage format (how images are stored in files)

Images are typically stored inline in `text` as `<img>` tags with **data URL** `src` values (usually WebP base64).

Editor-generated pattern:

```html
<img
  src="data:image/webp;base64,...."
  alt="image-name.png"
  class="editor-image"
  data-original-format="image/png"
/>
```

For compatibility, use:

- `src`: `data:image/...;base64,...` (**SHOULD**; self-contained and portable)
- `class`: at least `editor-image`
- Optional layout classes:
  - `editor-image editor-image-small`
  - `editor-image editor-image-medium`
  - `editor-image editor-image-full`
- Optional alignment inline styles exactly as editor uses:
  - left: `style="float:left;margin:0 1em 1em 0;"`
  - center: `style="float:none;margin:0 auto;display:block;"`
  - right: `style="float:right;margin:0 0 1em 1em;"`
- Optional metadata: `data-original-format="image/png"` (or jpeg/etc.)

Notes:

- The editor compresses dropped/pasted images to WebP and max dimension ~1200px.
- Large base64 images make JSON files very large. Prefer reasonably sized images.

## 9) Minimal valid examples

### notes\genesis-1.json

```json
{
  "book": "Genesis",
  "chapterNumber": 1,
  "text": "<p>In the beginning...</p><p><a href=\"#Exodus:1:2\">Exodus 1:2</a></p>"
}
```

### articles\mary.json

```json
{
  "id": "mary",
  "text": "<h2>Mary</h2><p>Article content...</p>"
}
```

## 10) Final checklist before running combine

1. Every note filename follows `<book-token>-<chapter>.json`.
2. Every note `book` exists in `books.json`.
3. Filename book token and note `book` refer to same canonical book.
4. Bible links in note HTML with `href="#Book:Chapter[:Verse]"` use known books.
5. HTML uses only supported tags/patterns above.
6. Hash links without `:` resolve to an existing article `id`.
