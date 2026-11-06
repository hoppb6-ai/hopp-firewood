# Hopp Firewood — app v5 / cache hf-v6

Static, local-first PWA for Brandon and Billy, served by GitHub Pages. No backend,
accounts, cloud sync, external calendars, push notifications or automatic sends.

## Start empty; choose who is working

PIN **1234** → **Brandon / Billy** → calendar Home. Unlock/user choice lasts only
for this browser tab's session. **Switch** changes partner without relocking;
**Lock** clears both. This is a public client-side soft gate, **not encryption or
secure authentication**. Do not store banking credentials in the app.

Fresh installs contain no customers, products, transactions, projects, goals or
example records. Every business section has a friendly first-entry prompt. The
calendar retains projects/goals, day sheets, month arrows/swipes, indicators,
KPIs and task creation. Quarterly federal tax dates are built-in *planning
reminders*, not invented transactions or recorded liabilities. They are Apr 15,
Jun 15, Sep 15 and the following Jan 15; check holiday/weekend adjustments.

New/edited business records retain creator and last editor, with a local activity
trail (latest 500 changes). Names are device attribution, not legal signatures.

## Company Assets

The main **Assets** tab contains Overview, Assets, Loans, Partner equity,
Expenses/purchases, Tax estimate and Mileage, without crowding the bottom bar.

- Equipment, vehicles, trailers and tools: purchase price/date, useful life,
  salvage and simple daily straight-line depreciation, capped at depreciable
  basis. Cash and inventory do not depreciate. Book values are not appraisals.
- Stock value uses each product's **unit cost**, not selling price. Do not also
  list the same stock as a separate Inventory asset.
- **Opening** cash/bank balances must precede app transactions. Running cash =
  opening cash + paid invoices (including collected sales tax) + contributions +
  loan cash received − expenses − flagged new cash asset purchases − draws − loan
  principal repaid. Existing assets should NOT subtract cash again. Loan current
  balance is manual; principal is not an expense. Avoid duplicate funding entries.
- Net worth = running cash + depreciated assets + stock at cost + unpaid
  receivables (excluding uncollected sales tax) − loan balances − collected sales
  tax still owed. This is a useful simplified ledger, not formal financial statements.
- Contributions/draws per partner change cash, not taxable profit. Ownership
  defaults to 50/50, editable in Settings or Partner equity; draws do not change it.
- Expenses have categories, deductibility/vehicle flags and optional local receipt
  photos. Photos are compressed to JPEG, max 1200px and 500,000 data-URL characters;
  detailed/unsupported images require cropping or converting. Browser storage is
  limited; save backups outside the browser. Saving is blocked during compression.

## Rough tax estimate — not tax advice

Prominent in-app/report warning: **Rough estimate only - not tax advice; confirm
with an accountant.** Assumes active partners taxed as a partnership, not an LLC
classification/election recommendation.

YTD paid-invoice subtotal (sales tax excluded) − deductible expenses − eligible
mileage − estimated depreciation = estimated net profit. Split by ownership.
For each partner, positive profit × 92.35% is the estimated SE base. SE = 12.4%
Social Security up to the remaining wage cap + 2.9% uncapped Medicare; bases below
$400 are modeled as zero. Other SS wages can reduce the remaining cap. Income tax
uses positive profit share less half SE tax, times selected federal bracket
(default 12%) and Michigan rate (default 4.25%). The displayed quarterly set-aside
is **YTD estimate / 4**, not an annualized forecast, safe-harbor payment or filing
instruction. Negative profits create no modeled tax benefit.

Verified official defaults on Nov 5, 2026, editable and not auto-updated:
- SS wage cap $184,500: [SSA](https://www.ssa.gov/news/en/cola/factsheets/2026.html)
- [IRS SE tax](https://www.irs.gov/businesses/small-businesses-self-employed/self-employment-tax-social-security-and-medicare-taxes)
- Mileage $0.725 Jan–Jun 2026, $0.76 Jul–Dec:
  [IRS mileage rates](https://www.irs.gov/tax-professionals/standard-mileage-rates).
  Per-trip rates are retained. Standard mileage excludes flagged vehicle expenses
  and vehicle depreciation to avoid double deduction; actual-cost mode ignores mileage.
- Michigan income 4.25%:
  [Michigan Treasury](https://www.michigan.gov/treasury/news/2026/04/15/state-individual-income-tax-rate-for-2026-tax-year-determined).
- Michigan retail sales tax 6% **may** apply to firewood; residential home-heating
  fuel may differ (4%); verify exemptions/resale and filing frequency:
  [Michigan sales/use tax](https://www.michigan.gov/taxes/business-taxes/sales-use-tax).
  Invoices accept a tax percentage or explicit amount override, not both added
  together. Tax is collected only on paid invoices; Sales tax remittance expenses
  reduce tax owed, never deductible income-tax expenses.

Not modeled: MACRS/Section 179, inventory COGS accounting, other income, standard
or itemized deductions, credits, QBI, guaranteed payments, elections, Additional
Medicare, city/local taxes, loss benefits or safe-harbor requirements. Capital
purchases/inventory are not automatically deductible. Accountant review required.

## Revision notes, backups and upgrades

**More → Feedback / revisions**: add/edit/status notes tagged with your name,
export and paste to your bot. Nothing sends automatically. Partner activity is
also under More. Every page/day/invoice offers branded PNG/PDF/CSV reports.

**Settings → Export JSON backup** includes all records, receipt photos,
assumptions and revision notes. A second **Share / Save JSON backup** tap supports
Save to Files on compatible phones; download/open fallbacks are also available.
**Import JSON backup REPLACES** this device's records, **does not merge**, and
validates before replacement. Back up first. Separate phone edits do not sync.
Treat exported files as private business information. Clear all data is confirmed;
there is no Reset to sample data option.

The app key stays `hf.data.v1`, schema becomes 6. Legacy releases did not retain
per-record seed provenance. One-time cleanup uses exact known seed fingerprints
and IDs, not fuzzy names or a global sample flag wipe. Edited/attributed/ambiguous
records survive, as do seeded customers/products linked from retained user invoices
or manual stock history. Only precisely identified untouched demonstration records
are marked and removed. A full **local pre-cleanup recovery snapshot** is stored
before removal and downloadable in Settings; no backup is transmitted. A one-time
notice explains the cleanup. If snapshot storage fails, removal is skipped.
Older unlabelled or edited examples may therefore require **manual review**; do not
silently delete uncertain records. Clear all data also removes the recovery snapshot.

Cache **hf-v6** bundles app scripts, html2canvas and jsPDF 4.2.1 (MIT, license in
vendor) locally; no runtime CDN. Reopen/reload online to receive the update. If
necessary fully close/reopen the installed app. **Do not clear Safari/site data**
to update: that deletes records. Only old `hf-*` caches are cleaned up.

## iPhone PNG / PDF saving

1. Choose Export → PNG (or invoice Save as PNG), wait for the preview.
2. Tap **Share / Save to Photos**, then **Save Image / Save to Photos**.
3. If sharing is unavailable, **press and hold the real preview image → Save to
   Photos**. Native image touch callouts/selection remain enabled.

PDF: **Share / Save PDF → Save to Files**, or Open PDF. Long-pressing its report
image saves a PNG, not the PDF. File creation/rendering finishes *before* the
second button appears; that tap calls `navigator.share` synchronously with the
already-built Files. Cancel is quiet; other failures explain fallback. Desktop
and Android retain downloads. The OS controls available actions; saving to Photos
cannot be confirmed by the app. This is not direct Photos-library access.

## Automated verification

```sh
python3 -m http.server 8765 --bind 127.0.0.1
CHROME_PATH=/opt/google/chrome/chrome node tests/acceptance.cjs
CHROME_PATH=/opt/google/chrome/chrome node tests/ios-export.cjs
```

Isolated 390×844 America/Detroit browser storage only, never a real user profile.
Tests create their own temporary records; none are seeded into shipped app data.
Acceptance covers PIN/user flow, all empty states, attribution, form-driven
financial entries and independently checked math, split/cap/loss cases, receipt
compression, planning CRUD, tax reminders, every page's nonempty PNG/PDF/CSV,
JSON round trip/invalid imports, conservative legacy cleanup, dark mode and offline.
Historical migration fixtures are generated from commit `65445e5` in a Node sandbox.
The iPhone regression suite mocks native sharing: real preview images, long-press
styles, synchronous trusted-button activation, File identity/MIME, error/cancel/
missing API paths, invoice PNG, JSON backup, offline, desktop/Android fallback.
No real message/share is sent. Headless Chromium is **not physical iPhone Safari**
and cannot exercise the native Photos UI.

Artifacts default `/workspace/firewood-v5/`; `ARTIFACT_DIR` and `TEST_URL` override.
PDFs can be inspected with `pdfinfo`, `pdftotext`, `pdftoppm`.
