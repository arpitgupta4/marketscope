// MarketScope Google Apps Script backend
// Reads your Google Sheet server-side, so the browser does not fetch the CSV directly.
// Spreadsheet ID comes from the user's original Google Sheets URL.
const SPREADSHEET_ID = "1wQyE21DFIU6LcV6tcmVZIGUrOvjYG158nlgIxlGRNEs";
const SHEET_NAME = ""; // Leave blank to use the first tab, or enter the exact tab name.

function doGet(e) {
  const callback = e && e.parameter ? e.parameter.callback : "";
  try {
    const payload = { ok: true, updatedAt: new Date().toISOString(), stocks: getStocks_() };
    return output_(payload, callback);
  } catch (err) {
    return output_({ ok: false, error: String(err && err.message ? err.message : err) }, callback);
  }
}

function output_(payload, callback) {
  const json = JSON.stringify(payload);
  // JSONP lets a static GitHub Pages site read the response without CORS fetch restrictions.
  if (callback && /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(callback)) {
    return ContentService.createTextOutput(callback + "(" + json + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function getStocks_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getSheets()[0];
  if (!sheet) throw new Error("Could not find the configured sheet tab.");
  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return [];

  // Find a likely header row in the first 10 rows. If not found, assume row 1.
  let headerRow = 0;
  for (let r = 0; r < Math.min(10, values.length); r++) {
    const joined = values[r].join(" ").toLowerCase();
    if (joined.includes("symbol") || joined.includes("ticker") || joined.includes("close")) {
      headerRow = r;
      break;
    }
  }
  const headers = values[headerRow].map(h => String(h || "").trim().toLowerCase());
  const findCol = patterns => headers.findIndex(h => patterns.some(p => h.includes(p)));

  // Known columns from the user's sheet: Symbol=C, Close=F, %Change=G.
  let symbolCol = findCol(["symbol", "ticker", "nse code"]);
  let closeCol = findCol(["close", "ltp", "price"]);
  let changeCol = findCol(["% change", "%change", "change %", "change%", "daily change", "change"]);

  if (symbolCol < 0) symbolCol = 2; // Column C
  if (closeCol < 0) closeCol = 5;   // Column F
  if (changeCol < 0) changeCol = 6; // Column G

  const nameCol = findCol(["company name", "stock name", "name"]);
  const sectorCol = findCol(["sector", "industry", "industry group"]);
  const rows = values.slice(headerRow + 1);
  const stocks = [];

  rows.forEach(row => {
    const symbol = String(row[symbolCol] || "").trim();
    if (!symbol) return;
    const close = parseNumber_(row[closeCol]);
    const change = parsePercent_(row[changeCol]);
    stocks.push({
      symbol: symbol,
      name: nameCol >= 0 ? String(row[nameCol] || "").trim() : "",
      sector: sectorCol >= 0 ? String(row[sectorCol] || "").trim() : "Unclassified",
      close: close,
      change: change
    });
  });
  return stocks;
}

function parseNumber_(value) {
  if (value === null || value === undefined || value === "") return null;
  const cleaned = String(value).replace(/[₹,\s]/g, "").replace(/%/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function parsePercent_(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = parseNumber_(value);
  return n;
}
