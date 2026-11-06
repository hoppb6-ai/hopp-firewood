# Hopp Firewood — app v5.2 / cache hf-v8

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
  per-asset method/class/business use and year-by-year depreciation schedules.
  MACRS defaults to 7-year; 3/5/7/10/15-year selectors, plain daily straight-line,
  Section 179 and bonus options remain available. Cash/inventory never depreciate.
  Book value uses regular depreciation, not accelerated tax write-offs or appraisals.
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

## Tax year 2026, take-home and equipment scenarios

**Rough estimate, not professional tax advice.** Assumes an active non-SSTB
firewood partnership. Set actual ownership and separate household assumptions
(filing status, other ordinary income, wages, exemptions, standard/itemized
override, QBI wage/property inputs). Defaults single/no outside income/one MI
exemption are examples, not personal facts. Federal tax is progressive, not the
previous flat 12% model. Business-attributable income tax is household tax with
business income minus household tax without it, floored at zero.

**Tax summary** uses records through today. **Take-home** and **What-if** use the
selected tax year's recorded payments/expenses through Dec 31 plus full annual
depreciation/deductions. They do NOT annualize revenue or invent December sales.
Monthly average = annual model / 12. A rolling Nov 2025–Nov 2026 demo is not the
same as calendar tax year 2026.

Taxable profit = paid revenue (excluding sales tax) − deductible expenses −
standard mileage (or actual vehicle costs, never both) − tax depreciation.
Cash in pocket = taxable profit + non-cash depreciation + mileage tax deduction −
other actual cash costs − asset cash price/down payments − actual principal −
estimated personal SE/federal/Michigan taxes. Actual vehicle cash costs still
reduce cash even when the mileage tax method excludes them. Recorded inventory
purchases reduce cash but are NOT automatically COGS; classify proper deductible
COGS/expenses with an accountant. Opening cash, owner funding, general loans and
draws are not earned take-home. This is allocable modeled earnings, not a bank
balance or promised distribution. Undated cumulative loan principal is never
silently attributed to a tax year: use the annual actual-principal adjustment.

**What-if** supports multiple editable cash/financed items, down payment/APR/term,
monthly amortization, current-year interest/principal/loan balances, expensing,
and all recovery classes. Presets: skid steer $45k, splitter $4k, dump trailer
$12k, processor $60k. Scenarios live only in memory; reloading clears them. No
ledger mutation occurs until **Add as asset** is explicitly confirmed. That adds
the asset and an opening loan only, NOT imaginary future interest/payments. Log
actual interest expenses, principal and loan balance updates separately.

Comparison shows taxable profit, each tax, total/saved taxes, annual/monthly
partner cash and net-worth reconciliation. Regular book value added − cash/down
payments − principal − interest − outstanding loan = book net-worth change before
personal taxes; the after-tax view adds modeled tax savings. A write-off does not
make equipment worthless or reimburse its purchase price.

### Verified official defaults (Nov 5, 2026; all editable in-app)

- [IRS Rev Proc 2025-32, 2026 tables](https://www.irs.gov/irb/2025-45_IRB): federal
  rates 10/12/22/24/32/35/37%. Standard deductions single/separate $16,100, joint
  $32,200, head $24,150. Full filing-status thresholds appear in Sources and its
  advanced editable JSON. Federal §179 cap $2,560,000; phaseout above $4,090,000;
  active-business-income limit also applies. Limited deductions/carryovers need
  review; no unused carryover benefit is invented.
- [SSA 2026](https://www.ssa.gov/news/en/cola/factsheets/2026.html): $184,500 SS
  wage base per person. [IRS SE](https://www.irs.gov/taxtopics/tc554): 92.35%
  earnings base, 12.4% SS + 2.9% Medicare, $400 earnings threshold, half regular
  SE tax deductible. [Additional Medicare](https://www.irs.gov/taxtopics/tc560):
  0.9% above $200k single/head, $250k joint, $125k separate; Medicare wages reduce
  the threshold. It is not part of the half-SE deduction.
- [QBI](https://www.irs.gov/newsroom/qualified-business-income-deduction):
  permanent 20%; 2026 active-business minimum $400 when eligible QBI ≥ $1,000.
  Wage/property limits phase in single/head $201,750–276,750; joint
  $403,500–553,500; separate $201,775–276,775. Assumes one non-SSTB trade, ordinary
  income and no net capital gains. Qualifying W-2/UBIA inputs are manual; scenario
  business basis is added to the scenario UBIA assumption.
- [IRS bonus](https://www.irs.gov/taxtopics/tc704): 100% eligible property acquired
  AND placed in service after Jan 19, 2025. Selecting the option assumes eligibility;
  confirm elections, related-party rules, recapture, listed-property restrictions.
- [Michigan decoupling notice](https://www.michigan.gov/treasury/reference/taxpayer-notices/2026/02/25/decoupling-michigan-income-taxes-from-certain-internal-revenue-code-provisions):
  IIT/FTE retains pre-OBBBA bonus: 40% for 2025 acquisitions, 20% for 2026, plus
  regular MACRS on remaining basis. Federal/state deductions and annual addback
  are separate. **Exact inflation-indexed Michigan 2026 §179 cap/phaseout could
  not be confirmed**: conservative verified 2025 floors $1.25m/$3.13m are editable
  and labeled unconfirmed, with a warning for larger purchases. No false claim
  that federal limits apply to Michigan.
- [IRS mileage](https://www.irs.gov/tax-professionals/standard-mileage-rates):
  $.725 Jan–Jun 2026, $.76 Jul–Dec. Per-trip rates remain stored/editable.
- [Michigan income](https://www.michigan.gov/treasury/news/2026/04/15/state-individual-income-tax-rate-for-2026-tax-year-determined):
  4.25%; [personal exemption](https://www.michigan.gov/taxes/business-taxes/withholding/calendar-year-tax-information)
  $5,900 each. Michigan uses AGI with state depreciation adjustments, NOT federal
  taxable income after the federal standard/QBI deductions.
- [Michigan sales tax](https://www.michigan.gov/taxes/business-taxes/sales-use-tax):
  6% taxable retail rate. Verify exemptions/certificates. Collected sales tax is
  not revenue, and remittances are not deductible income-tax expenses.

### MACRS and book schedules

[IRS Pub 946 (March 2026), Table A-1 p.71](https://www.irs.gov/pub/irs-pdf/p946.pdf)
provides exact half-year rates for 3/5/7/10 years at GDS **200% DB**, and 15 years
at **150% DB** (not 200%). Seven-year percentages: 14.29, 24.49, 17.49, 12.49,
8.93, 8.92, 8.93, 4.46. Every class's full table is in `depreciation.js`; rounded
last-year amounts reconcile to basis. Salvage applies only to plain SL. Book
schedule uses full cost; tax schedule applies business-use percentage. Full
expensing doesn't erase planning asset value. Exports include annual requested
federal and Michigan deductions **before aggregate annual §179 limits**.

Class hints are not automatic classification: light trucks/trailers, construction
skid steers and logging equipment commonly 5-year; general equipment/furniture
commonly 7-year. Default 7-year is owner-requested, not an assertion every item
belongs there. Verify each class and existing elections with an accountant.
Half-year is the requested model assumption; >40% Q4 eligible basis can require
mid-quarter convention (flagged for scenarios), which is not implemented. Plain
SL is a daily planning alternative, not a MACRS election calculation. Losses,
carryovers, credits, AMT, guaranteed payments, retirement/health AGI adjustments,
other businesses, capital gains, Michigan special subtractions, FTE elections,
vehicle caps and safe-harbor payments are not fully modeled. Do not file from it.

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

The v5.2 migration preserves the existing demo and user records, initializes tax
assumptions once and gives method-less equipment the requested default 7-year
MACRS planning model. It does not change prior tax returns or actual tax elections.

The app key stays `hf.data.v1`, schema becomes 8. The one-time v5.1 migration
matches old per-record sample flags, exact seed IDs and known seeded names,
including `(Sample)` labels. It removes edited seeds too; it does not delete all
rows just because `sampleData` is true. Arbitrary user-created products are not
removed for mentioning pizza or smokers. Retained copy is normalized to seasoned
hardwood. A **local pre-update recovery snapshot** is saved before old-seed removal
and can be downloaded in Settings; no backup is transmitted. If saving fails,
original data stays untouched and the app shows a storage warning.

Cache **hf-v8** includes every script and bundled export library, without a runtime
CDN. Installation uses `skipWaiting`, activation awaits `clients.claim`, and HTML
and JS are **network-first with HTTP-cache bypass**, falling back offline. App
scripts also carry `?v=5.2`. The app checks for SW updates on opening, returning
to the foreground, reconnecting and once per minute. An **Update available - tap
to reload** banner appears when an existing controlled page receives an update.

### Billy’s Android update steps (do not delete site storage)
1. Connect to the internet and export a JSON backup if the phone has real entries.
2. Fully close Hopp Firewood (remove it from Recents), then reopen it online.
3. Tap **Update available - tap to reload** if shown. If still on the old screen,
   open `https://hoppb6-ai.github.io/hopp-firewood/?v=5.2` in Chrome and refresh
   once, then close/reopen the installed app.
4. Confirm **v5.2** on the PIN footer or **App version v5.2 · Cache hf-v8** in
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
CHROME_PATH=/opt/google/chrome/chrome node tests/v52.cjs
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

Artifacts default `/workspace/firewood-v52/`; `ARTIFACT_DIR` and `TEST_URL` override.
PDFs can be inspected with `pdfinfo`, `pdftotext`, `pdftoppm`.
