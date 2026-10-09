# TruckFlow USA - Dispatcher Web App Prototype

White + purple dispatcher dashboard for US truck drivers and fleet owners.
All loads shown are **Sample data**, not real loads. Nothing here guarantees loads, rates or earnings.

## What's new in this version
1. **Nearby load search** (Driver > Find Loads)
   - Type a city ("Dallas, TX") or tap "Use my location".
   - Choose distance (50 / 100 / 250 / 500 miles / any), truck type, and sort (nearest pickup or best rate per mile).
   - Each load shows how many miles the pickup is from you.
   - "Nearby pickup cities" chips let you view loads from one nearby place at a time.
   - Distance is straight-line miles from city coordinates in `js/app.js` (the `CITIES` list). Add cities there.
2. **Owner "Post a load" now works** - posted loads are saved in the browser and appear in the driver search.
3. **AI chat assistant** (chat button, bottom-right)
   - With the server and an API key: answers use the Anthropic API and the loads near the driver.
   - Without them: it switches to "Basic mode" (built-in answers about nearby loads, rates and pricing).

4. **Updated for trucking basics (from the client training slides)**
   - All 8 truck types: Power Only, Dry Van, Reefer, Flatbed, Step Deck, Hot-Shot, Box Truck, Cargo Van, each with length, weight limit, doors, accessories and a *reference* rate per mile.
   - New **Truck Guide** page (sidebar > Learn): how a load moves (Shipper, Broker, Dispatcher, Carrier, Receiver), truck cards, solo vs team drivers, CDL and ELD.
   - Find Loads: filter by any truck type, choose Solo or Team driver, see load weight, estimated days at legal miles per day (600 solo, 1,200 team) and whether the rate is inside the reference range.
   - Owner paperwork: truck type, driver type, CDL and ELD fields. Post a load: all truck types.
   - Chatbot and AI prompt know the truck facts above.
   - Rate ranges are examples from training material, not guaranteed. Weekly gross figures from the slides are intentionally left out.

5. **Delivery confirmation by the owner**
   - Drivers only track the route. The button now says "I have arrived" and sends the load to the owner (status: Waiting for owner).
   - The owner reviews it under **Deliveries** and chooses "Confirm delivered" or "Not received yet".
   - Only the owner's confirmation completes the load, records payment and counts toward the free loads.
   - Demo note: both roles share the same browser storage, so test by logging out and in as the other role in the same browser. A real version needs a backend so each role uses its own device.

## Run (basic, no AI)
Open `index.html` in a browser, or use VS Code Live Server. Demo login is shown on the page.

## Run with the AI chatbot (Node.js 18+)
The API key must stay on the server, never in browser code.
1. Get an API key from console.anthropic.com.
2. In this folder:
   - Mac/Linux: `ANTHROPIC_API_KEY=your-key node server.js`
   - Windows PowerShell: `$env:ANTHROPIC_API_KEY="your-key"; node server.js`
3. Open http://localhost:3000 - the chat badge shows "AI" when it works.

Optional: `ANTHROPIC_MODEL` to pick a model (default `claude-sonnet-5-5`), `PORT` to change the port.

## Files
- `index.html`, `css/styles.css` - page and styles
- `js/app.js` - dashboards, sample loads, nearby search
- `js/chatbot.js` - chat window (AI + basic mode)
- `server.js` - static server + private `/api/chat` (rate-limited, input-checked)

## Real load data
Live loads need a licensed source (for example a load-board or broker API such as DAT or Truckstop; they require an agreement and fees). Replace `demoLoads` with data from your own backend, keeping the same fields.

## Still a prototype
Add real authentication, a database, secure document storage, MC/DOT verification, live GPS/routing, payments and a legal review before real use.
