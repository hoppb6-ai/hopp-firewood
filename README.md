# Hopp Firewood

Static, local-first PWA for Brandon and Billy. GitHub Pages serves the repository root.

## hf-v3
- Four-digit keypad (test PIN **1234**), session-only unlock, and Lock action.
  This client-side soft gate is **not authentication or encryption**; the PIN is public.
- Home dashboard with orders / pending deliveries (invoices awaiting delivery),
  outstanding balances, collected payments, customers, and inventory.
- One-time samples: New Holland Knickerbocker plus explicitly fictional sample
  customers, products, paid/unpaid invoices, deliveries, expenses, and stock history.
  All sample transactions are demonstrations, not real New Holland business data.
- Slate/navy theme, SVG navigation, coordinated app icons and print/PNG invoice design.
  The invoice sheet itself has 36px padding, which is included in the PNG capture.
- Settings: Brandon/Billy attribution, JSON backup/import, confirmed reset to samples
  or clear business records. Clearing persists an empty dataset (does not re-seed).

Existing `hf.data.v1` data is never automatically replaced. Samples are seeded and
persisted only when that app-specific key is absent. Existing installations can
choose **Settings → Reset to sample data** after backing up. Legacy local login
records are untouched but no longer used. Data is local to each browser; the phones
do not sync. Clearing site storage externally removes the records and session.

Service worker cache: `hf-v3` (network first, cached offline fallback). Reload the
installed app online to receive an update.

## Local acceptance test

```sh
python3 -m http.server 8765 --bind 127.0.0.1
# In another terminal, with Playwright installed and Chromium available:
CHROME_PATH=/opt/google/chrome/chrome node tests/acceptance.cjs
```

The test uses a fresh, isolated headless Chromium browser at 390×844. It covers
correct/wrong PIN, session and saved-data persistence, all tabs and SVG navigation,
PNG download, clear/reset, Brandon/Billy attribution, stock/delivery/payment/expense
mutations, backup export, and offline reload. Screenshots and test results default
to `/workspace/firewood-v2/`; override with `ARTIFACT_DIR`. `TEST_URL` can point to
another local test origin. Never test against real user browser storage.
