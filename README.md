# Asta Café – Bestellanzeige

Zahlungen vom SumUp-Terminal / der SumUp-App werden automatisch als Bestellungen übernommen und auf zwei Seiten angezeigt:

- `/bestellungen` – Liste für die Theke/Küche, Haken = Bestellung ist fertig
- `/pickup` – Anzeige für den Gast-Bildschirm: „Zubereitung“ und „Abholung“ mit Countdown, Klick auf eine Nummer = abgeholt

Jeder Zahlung wird automatisch eine Abholnummer (1–99) zugewiesen.

## Setup

```
cp .env.example .env   # SumUp-Zugangsdaten eintragen
yarn install
yarn dev
```

Bestellungen werden in `data/orders.json` gespeichert (anderer Ordner: `DATA_DIR`).
Ein Poller in `server/plugins/sumup.js` fragt alle `SUMUP_POLL_SECONDS` Sekunden die SumUp-Transaktionshistorie ab.

## Testen ohne Terminal (nur Dev-Modus)

```
curl -X POST localhost:3000/api/sumupTest -H 'content-type: application/json' \
  -d '{"name":"7","orderType":"Cappuccino","price":2.5}'
```
