MARKETSCOPE — BEGINNER SETUP
============================

WHAT THIS PACKAGE DOES
- Uses Google Apps Script to read your Google Sheet on Google's servers.
- The browser does not fetch the published CSV directly, avoiding the original direct-fetch/CORS issue.
- The front end is a Progressive Web App (PWA) intended for GitHub Pages.
- Includes search, sector filter (if your sheet has a sector/industry column), sorting by daily % change and price, and gainers/losers counts.

YOUR SHEET
Spreadsheet ID is already filled into Code.gs:
1wQyE21DFIU6LcV6tcmVZIGUrOvjYG158nlgIxlGRNEs

Known columns from your earlier description:
- Symbol: column C
- Close: column F
- % Change: column G
The backend also tries to detect headers. If there is no sector/industry column, all rows will be "Unclassified".
IMPORTANT: GoogleFinance formulas must be calculated in the sheet for their values to appear. This app does not itself supply live exchange quotes.

PART A — MAKE THE GOOGLE SHEETS DATA ENDPOINT
1. On a computer if possible, open https://script.google.com/
2. Click New project.
3. Open Code.gs in this ZIP and copy all of its contents into the Apps Script editor, replacing the sample code.
4. Click the + next to Files, choose HTML, and name it Index only if you want to keep a copy of the UI in Apps Script. (Not required for the GitHub Pages version.)
5. Click Save.
6. Click Deploy > New deployment.
7. Click the gear/type picker and choose Web app.
8. Set "Execute as" to Me.
9. Set access to "Anyone" (or "Anyone with the link", depending on the wording shown).
   This endpoint returns stock data to anyone who has its URL. Only use this for data you are comfortable exposing. Never put passwords or secret information in the sheet.
10. Click Deploy and approve the Google authorization prompt.
11. Copy the web app URL ending in /exec.
12. Open index.html in a text editor and replace:
   PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE
   with your copied URL, keeping the quote marks. Save the file.

TEST THE ENDPOINT
Open this URL in your browser:
YOUR_WEB_APP_URL/exec
You should see JSON with "ok":true and a "stocks" array.
To test JSONP, open:
YOUR_WEB_APP_URL/exec?callback=testCallback
You should see JavaScript starting with testCallback({"ok":true...

If deployment says access is restricted or does not allow anonymous users, your Google account or Workspace administrator may prevent public web apps. Do not continue with "Anyone" if your data should remain private.

PART B — PUBLISH THE APP WITH GITHUB PAGES
1. Sign in at https://github.com/ and create a new repository named marketscope.
2. Set it to Public (GitHub Pages generally needs a public repository on free accounts).
3. Upload these files into the repository root:
   index.html
   manifest.webmanifest
   sw.js
   icon.svg
   (Code.gs is backend source; you do not need to upload it to the website repository.)
4. In the repository, open Settings > Pages.
5. Under Build and deployment, choose "Deploy from a branch".
6. Choose branch "main" and folder "/ (root)", then Save.
7. Wait for the published site URL shown on the Pages settings screen. It usually looks like:
   https://YOUR-USERNAME.github.io/marketscope/
8. Open that URL on your Samsung phone in Chrome and test search/filter/sorting.

PART C — ADD TO SAMSUNG HOME SCREEN
1. Open the published HTTPS website in Chrome.
2. Tap the three-dot menu.
3. Choose "Install app" if available. Otherwise choose "Add to Home screen".
4. Confirm and launch MarketScope from the icon.

TROUBLESHOOTING
- "Setup needed": the API_URL placeholder in index.html was not replaced with the Apps Script /exec URL.
- "Connection failed": open the /exec URL in Chrome. Confirm you see JSON with ok:true, and that the deployment access is set correctly.
- "Could not find configured sheet tab": leave SHEET_NAME blank to use the first tab, or enter the exact tab name in Code.gs.
- Wrong stock count or empty prices: check that the correct sheet tab is first, formulas have calculated, and columns C/F/G still contain symbol/close/change.
- Sector filter shows only "Unclassified": add a header called Sector or Industry and values in that column, or modify the sector mapping in Code.gs.
- After editing index.html on GitHub, refresh the page. If the old UI remains, clear site data/cache or change CACHE version in sw.js.

SECURITY / RELIABILITY NOTES
- A public Apps Script endpoint can expose the sheet's returned data to anyone who has the URL. Do not include sensitive information.
- This is a personal stock tracker, not a trading platform. Values can be delayed, blank, or stale depending on your sheet's formulas and Google Finance availability.
- The app shell can open after it has been cached, but live stock data still needs an internet connection.
