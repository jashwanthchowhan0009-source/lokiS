# Loki'S Power Bowl

Website for Loki'S Power Bowl, Lokesh's healthy food stall in Anantapur, Andhra Pradesh.

Plain HTML, CSS and JavaScript. No build step, no dependencies.

| Page | File |
| --- | --- |
| Home (menu, benefits, order builder) | `index.html` |
| Loki'S, the founder page | `lokis.html` |
| Order now | `order.html` |

## Run it

Open `index.html`, or serve the folder: `python3 -m http.server`.
It deploys as-is to GitHub Pages or Vercel (static, root directory).

## Change the order contact

The WhatsApp number, email and menu live at the top of `js/main.js` (`PHONE`, `EMAIL`, `MENU`).
The static links inside the HTML (menu cards, footer, order page) use the same number: search for `wa.me/919963603614`.

## Things to fill in

- Prices are not shown; the site says "ask on WhatsApp for today's price".
- The founder page copy is brand copy. Replace it with Lokesh's own story when ready.
