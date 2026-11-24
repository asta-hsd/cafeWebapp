# Café-Webapp

Zeigt SumUp-Verkäufe als Bestellungen an. Keine Abhängigkeiten, nur Node >= 20.6.

```
cp .env.example .env   # SumUp-Key + Merchant-Code eintragen
npm start
```

- Es werden nur Artikel übernommen, die in SumUp die Kategorie `CafeSystem` haben (anpassbar per `ITEM_CATEGORY` in `.env`, Groß-/Kleinschreibung egal). Verkäufe ohne Artikel dieser Kategorie werden ignoriert; bei gemischten Verkäufen landen nur die passenden Artikel in der Bestellung. Abgefragt werden per `POST /sales/search` nur abgeschlossene Verkäufe aus dem Kanal `POS` (anpassbar per `SALES_CHANNELS`, z. B. `POS,SOLO`). Mit `DEBUG_SALES=1` wird die Item-Struktur der SumUp-Verkäufe geloggt.
- `/bestellungen` – offene Bestellungen, Artikel abhaken
- `/pickup` – 2. Display: links Zubereitung, rechts Abholung (Klick = abgeholt)
- `/next` – 3. Screen: zeigt den Namen, den die nächste Bestellung bekommt (wechselt, sobald eine Bestellung eingeht)
- `names.json` – Liste möglicher Abholnamen (es wird immer ein gerade freier Name vergeben)
- `ENABLE_TEST=1` -> `curl -X POST localhost:3000/api/test -H 'content-type: application/json' -d '{"items":["Cappuccino","Muffin"]}'`
