# Café-Webapp

Zeigt SumUp-Verkäufe als Bestellungen an. Keine Abhängigkeiten, nur Node >= 20.6.

```
cp .env.example .env   # SumUp-Key + Merchant-Code eintragen
npm start
```

- `/bestellungen` – offene Bestellungen, Artikel abhaken
- `/pickup` – 2. Display: links Zubereitung, rechts Abholung (Klick = abgeholt)
- `/next` – 3. Screen: zeigt den Namen, den die nächste Bestellung bekommt (wechselt, sobald eine Bestellung eingeht)
- `names.json` – Liste möglicher Abholnamen (es wird immer ein gerade freier Name vergeben)
- `ENABLE_TEST=1` -> `curl -X POST localhost:3000/api/test -H 'content-type: application/json' -d '{"items":["Cappuccino","Muffin"]}'`
