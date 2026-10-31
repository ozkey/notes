# AI Notes/Articles Authoring Contract (STRICT)

This folder is written by an external AI and then merged by:

- `packages/ui/scripts/combine-ai-notes.js`

If you follow this file exactly, output will be compatible with the app/editor and combine script.

## 1) Where to write files

- Bible chapter notes: `packages/ui/src/public/notes/ai/notes/*.json`
- Articles: `packages/ui/src/public/notes/ai/articles/*.json`
- Valid book list: `packages/ui/src/public/notes/ai/books.json`

Only write `.json` files in `notes` and `articles`.

## 2) Required JSON shapes

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

- `book` (required): must match a book from `books.json` (case-insensitive match).
- `chapterNumber` (required): positive integer.
- `text` (required): HTML string.
- `highlights` (optional): array of `{ verse: number, color: "green"|"blue"|"pink"|"red"|"orange"|"purple" }`.

### Article file shape

```json
{
  "id": "mary",
  "text": "<p>...</p>"
}
```

- `id` (required): slug-like article id (recommended lowercase + hyphen).
- `text` (required): HTML string.

## 3) Note filename rules (required for combine)

Each note filename must be:

`<book-token>-<chapter>.json`

Examples:

- `genesis-1.json`
- `song-of-solomon-2.json`
- `i-samuel-3.json`
- `1-samuel-3.json` (also accepted)

Important:

- Final segment must be chapter number.
- Do **not** add suffixes like `-2` to note filenames (`genesis-1-2.json` is invalid for combine validation).
- `book` in file content must match the same canonical book as filename token.

## 4) Bible link rules inside `text` (required for combine)

When using Bible links in HTML, use:

- `href="#Book:Chapter"` or
- `href="#Book:Chapter:Verse"`

Examples:

- `<a href="#Exodus:1">Exodus 1</a>`
- `<a href="#Exodus:1:2">Exodus 1:2</a>`

Rules:

- Book in `href` must exist in `books.json`.
- Use double quotes in attributes (`href="..."`).
- Book separators in hash can be spaces or `-`/`_` (editor/parser handles these).

## 5) Article links inside `text`

To link to an article tab, use:

- `href="#<article-id>"`

Example:

- `<a href="#mary">#mary</a>`

Keep `article-id` normalized (lowercase, hyphenated, no spaces) for best compatibility.

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

Keep HTML simple, semantic, and in the supported set above.

## 8) Image storage format (how images are stored in files)

Images are stored inline in `text` as `<img>` tags with **data URL** `src` values (usually WebP base64).

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

- `src`: `data:image/...;base64,...` (recommended; self-contained and portable)
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
4. Bible links in `href="#Book:Chapter[:Verse]"` use known books.
5. HTML uses only supported tags/patterns above.
