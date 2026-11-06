# Hopp Firewood

A static, local-first PWA for Brandon and Billy. GitHub Pages serves the root.
No backend, external calendar integration, accounts, notifications or device sync.

## hf-v5 — iPhone-safe image/PDF saving

PNG and PDF now use a two-step flow on every page and invoice:
1. Tap the export format and wait for the preview to appear.
2. Tap **Share / Save to Photos** (PNG), then choose **Save Image** / **Save to
   Photos** in the iPhone share sheet. For PDF, tap **Share / Save PDF** and choose
   **Save to Files**.

If sharing is unavailable or rejected, the preview stays visible. Press and hold
its real image and choose **Save to Photos**. The image is a decoded PNG data URL,
not a canvas; native touch callouts and selection are explicitly allowed. A PDF
also has a report-image preview (long-press saves that PNG, not the PDF), an explicit
Open PDF link, and a Download button. Desktop/Android retain download fallback.
Cancelled shares are quiet and never trigger an unwanted download.

Rendering, FileReader work and File creation finish before the share button is
shown. Its synchronous click handler calls `navigator.share` with those same
prebuilt Files before any Promise/await boundary, preserving iOS user activation.
The browser/OS controls available share-sheet actions; the app cannot confirm
that a Photos item was saved. No direct Photos-library access is requested.
Closing the sheet releases retained files and PDF URLs, and cancels stale renders.

Existing data/schema is unchanged. Service-worker cache is **hf-v5**; reopen/reload
the installed app online to receive the update. If it still shows the old export
flow, fully close and reopen it; do not clear site data, which would erase records.

## Calendar, planning and reporting

- Home: swipeable month calendar, arrow navigation, day-detail sheets and direct
  creation of tasks, milestones, planned bills and delivery reminders.
- Six indicator categories: completed work, goals/milestones, money due,
  expenses/bills, scheduled deliveries and tasks. Overdue receivables are marked.
  Calendar data comes from invoice due/delivery dates, actual expenses, projects,
  goals and local calendar items. Planned bills are NOT automatically expenses;
  planned delivery reminders are NOT invoice-backed orders.
- KPIs: open receivables, overdue receivables, money collected this calendar month,
  and invoice-backed deliveries dated today or later.
- Current project with progress, next step and deadline. Add/edit/complete/reopen,
  pick a current project; completion selects the next unfinished project.
- Goals: collected-revenue and fulfilled-cord targets compute from paid/fulfilled
  invoices inside each goal's start/end period. Custom goals have manual progress.
  Cord equivalents use the editable product conversion; sample values are estimates.
- More menu keeps Projects, Goals, Deliveries and Settings off the main nav.
  Its badge counts overdue invoices and unfinished calendar items due through today.
- Every page offers consistent PNG, PDF and CSV export, as do day sheets and invoice
  details. Reports are branded data renders, not screenshots of app controls.
  Calendar exports include a branded month grid and agenda.
  PNG exports split into parts at 25 rows; PDF tables paginate with repeating brand,
  column headings and page numbers. CSV escapes spreadsheet formula prefixes.
- PNG/PDF preview first, then share on a fresh button tap. iPhone has a real-image
  long-press fallback; desktop/Android can download. CSV keeps direct sharing/download.
- Light/dark/device appearance modes. Exports always use a clean white/blue theme.

### Offline libraries and license

`vendor/html2canvas.min.js` and `vendor/jspdf.umd.min.js` (jsPDF 4.2.1, MIT; license
bundled in `vendor/jspdf.LICENSE.txt`) are served locally, not from a runtime CDN.
Only jsPDF's core text/drawing APIs are used; optional HTML/font modules are not
loaded. The `hf-v5` service worker caches both libraries, scripts and app assets.
Cache cleanup affects only older `hf-*` caches, not other PWAs on the same origin.

### Data and upgrade behavior

The app key remains `hf.data.v1`; the planning schema is version 4.
- A missing app key gets the full sample workspace, including New Holland
  Knickerbocker, explicitly fictional customers, products, paid/unpaid invoices,
  deliveries, expenses, stock history, two projects, three goals and seven calendar
  items spanning the current and following month.
- Existing sample workspaces receive missing planning collections once, plus
  sample cord conversions and date fields; existing business records are retained.
- Real workspaces receive empty planning collections, not invented transactions.
  Existing invoice date is the fallback for missing due/delivery dates; users can
  edit both dates on invoice forms. No saved records are automatically deleted.
- Clear all data persists an empty dataset. Reset to sample data is a confirmed,
  explicit replacement. Export a JSON backup before either action.
- Backup/import includes projects, goals, events and current project. Restoring old
  backups preserves old collections and starts missing planning collections empty.
- All sample transactions are demonstrations, not actual New Holland charges.

### Session PIN

Test PIN: **1234**. Unlock is remembered in this browser tab's sessionStorage only;
Lock clears it. This client-side soft gate is NOT authentication or encryption;
the PIN is public in static source. Legacy user/password records remain untouched
but are no longer used. Data stays local to each browser and phones do not sync.

## Test locally

```sh
python3 -m http.server 8765 --bind 127.0.0.1
# Another terminal, with Playwright installed and Chromium available:
CHROME_PATH=/opt/google/chrome/chrome node tests/acceptance.cjs
```

The suite uses isolated browser storage at 390×844, America/Detroit. It covers PIN,
calendar indicators/legend/day details/arrows/swipe, project/goal/calendar CRUD,
computed progress, every page's PNG/PDF/CSV bytes, sharing (mocked, no real send),
dark mode, migration, clear/reset, and offline reload/exports. It checks console
errors and horizontal overflow. `ARTIFACT_DIR` defaults to `/workspace/firewood-v4`;
`TEST_URL` overrides the local origin. Never point tests at a real user profile.
PDFs can be inspected with `pdfinfo`, `pdftotext` and `pdftoppm`.

### iPhone/PWA regression tests

```sh
CHROME_PATH=/opt/google/chrome/chrome node tests/ios-export.cjs
```

Uses an iPhone user agent, touch viewport and mocked standalone mode/share API in
headless Chromium. Tests every page's PNG/PDF preview, decoded real images, native
callout styles, no automatic sharing during preparation, trusted synchronous
button invocation, unchanged File identity/name/MIME, rejected/cancelled/missing
sharing, invoice PNG, cleanup/cancellation and offline use. This is not a physical
iPhone/Safari test and cannot exercise the native Photos permission/share UI.
