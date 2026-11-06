# Hopp Firewood — app v5.1 / cache hf-v7

Static, local-first PWA for Brandon and Billy, served by GitHub Pages. No backend,
accounts, cloud sync, external calendars, push notifications or automatic sends.

## Kitchen demonstration; choose who is working

PIN **1234** → **Brandon / Billy** → calendar Home. Unlock/user choice lasts only
for this browser tab's session. **Switch** changes partner without relocking;
**Lock** clears both. This is a public client-side soft gate, **not encryption or
secure authentication**. Do not store banking credentials in the app.

On this release’s first run, the app removes known v2–v4 demonstration seeds
(including edited seeds) and loads **10 fictional kitchen customers**. All
new demo records have `demo: true`, `demoVersion: "v51"` and stable demo IDs;
normal edits keep these flags. Own records are not wiped by a global sample bit.

The full rolling year is **Nov 5, 2025–Nov 5, 2026**. Each customer has **53 weekly
invoices**, dated Nov 5, 2025 through Nov 4, 2026, with next-day deliveries.
Demand is steady, not seasonal; months naturally contain four or five weekly
orders, with partial November boundary months. Revenue means invoice subtotals
**before tax, including paid and unpaid invoices**. These are kitchen cooking
accounts, not residential heating customers. All products are seasoned hardwood
by the full cord or face cord, plus delivery and rack-stacking services.

| Fictional kitchen | Annual invoiced revenue |
| --- | ---: |
| Ember Table Restaurant Group | $20,140 |
| Cinder Lane Pizzeria | $19,610 |
| Copper Oak Steakhouse | $20,935 |
| Juniper Hearth Bakery | $19,080 |
| Blue Ash Barbecue | $20,405 |
| Stonebridge Woodfire Bistro | $20,670 |
| Foxglove Flatbread Kitchen | $19,345 |
| Red Maple Chophouse | $21,200 |
| Willow & Flame Trattoria | $19,875 |
| Hearthstone Smoke Kitchen | $21,465 |

**Ember Table** demonstrates three rotating delivery locations, a purchasing
contact, consolidated net-30 terms, a fictional resale certificate, weekly
calendar reminders and location-specific invoice notes. **Cinder Lane** shows
back-door/gate instructions, a covered stacking rack, preferred delivery days,
a **$1,250 prepaid credit reference**, linked mileage, a related expense with a
fictional receipt photo, and a partner revision note. Credit is informational:
it does not apply to invoices or alter running cash automatically. Certificates,
names, phone numbers, addresses, receipts and transactions are fictional.

**More → Settings → Load demo data / Remove demo data** each requires confirmation.
Load replaces the tagged demo, not your own records; repeated loads do not add
copies. Remove also removes edited demo records. Your own records remain, but
links from them to removed demo accounts/products will no longer resolve.
Removed demo data does not reappear on reload. **Clear all data** remains and
stays empty until you explicitly choose Load demo data. Back up before either.
Each phone has independent data; there is no sync.

Quarterly federal tax dates remain built-in *planning reminders*, not recorded
transactions: Apr 15, Jun 15, Sep 15 and the following Jan 15; confirm calendar
adjustments. Monthly expenses, mileage, equipment depreciation, loans, partner
contributions/draws, goals and the current project complete the demo workspace.
Inventory purchases are not modeled as COGS in the rough tax estimator; its
limitations still apply to these illustrative numbers.

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
demo management is separate from clearing all data.

The app key stays `hf.data.v1`, schema becomes 7. The one-time v5.1 migration
matches old per-record sample flags, exact seed IDs and known seeded names,
including `(Sample)` labels. It removes edited seeds too; it does not delete all
rows just because `sampleData` is true. Arbitrary user-created products are not
removed for mentioning pizza or smokers. Retained copy is normalized to seasoned
hardwood. A **local pre-update recovery snapshot** is saved before old-seed removal
and can be downloaded in Settings; no backup is transmitted. If saving fails,
original data stays untouched and the app shows a storage warning.

Cache **hf-v7** includes every script and bundled export library, without a runtime
CDN. Installation uses `skipWaiting`, activation awaits `clients.claim`, and HTML
and JS are **network-first with HTTP-cache bypass**, falling back offline. App
scripts also carry `?v=5.1`. The app checks for SW updates on opening, returning
to the foreground, reconnecting and once per minute. An **Update available - tap
to reload** banner appears when an existing controlled page receives an update.

### Billy’s Android update steps (do not delete site storage)
1. Connect to the internet and export a JSON backup if the phone has real entries.
2. Fully close Hopp Firewood (remove it from Recents), then reopen it online.
3. Tap **Update available - tap to reload** if shown. If still on the old screen,
   open `https://hoppb6-ai.github.io/hopp-firewood/?v=5.1` in Chrome and refresh
   once, then close/reopen the installed app.
4. Confirm **v5.1** on the PIN footer or **App version v5.1 · Cache hf-v7** in
   More → Settings. PIN 1234 → Billy → calendar. Demo loads once on this device;
   use Settings → Load demo data if you previously removed it.
5. Do **not** clear Chrome/site data or uninstall as an update fix: local records
   can be lost. If storage is full, export the backup before freeing anything.

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
CHROME_PATH=/opt/google/chrome/chrome node tests/v51.cjs
CHROME_PATH=/opt/google/chrome/chrome node tests/acceptance.cjs
CHROME_PATH=/opt/google/chrome/chrome node tests/ios-export.cjs
```

Isolated 390×844 America/Detroit browser storage only, never a real user profile.
Tests use isolated browser contexts and temporary records, never a real device’s
storage. The v5.1 suite covers demo totals/cadence, showcase fields and receipts,
all-page CSV and PNG/PDF exports, load/remove/clear persistence, edited v4 and
already-reviewed v5 migrations, online SW upgrade/banner and offline operation.
The existing acceptance suite removes its isolated demo before independent
ledger-math/CRUD/backup/export regressions. Historical fixtures come from commit
`65445e5` in a Node sandbox.
The iPhone regression suite mocks native sharing: real preview images, long-press
styles, synchronous trusted-button activation, File identity/MIME, error/cancel/
missing API paths, invoice PNG, JSON backup, offline, desktop/Android fallback.
No real message/share is sent. Headless Chromium is **not physical iPhone Safari**
and cannot exercise the native Photos UI.

Artifacts default `/workspace/firewood-v51/`; `ARTIFACT_DIR` and `TEST_URL` override.
PDFs can be inspected with `pdfinfo`, `pdftotext`, `pdftoppm`.
