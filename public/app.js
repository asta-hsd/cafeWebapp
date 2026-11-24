// gemeinsame Helfer für alle Seiten
const CHECK = '<svg viewBox="0 0 40 28" fill="none"><path d="M4.8 12.9L15.9 24 35.8 4" stroke="#80C587" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>'

// To-go-Becher (Linien-Icon, übernimmt die Textfarbe)
const TOGO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3.5h10l.8 3H6.2z"/><path d="M6.4 6.5L8 21h8l1.6-14.5"/><path d="M6.9 11.5h10.2v5H6.9z" fill="currentColor" fill-opacity=".15"/></svg>'

function connect(onState, onReady) {
	const es = new EventSource('/events') // verbindet sich bei Abbruch automatisch neu
	es.onmessage = e => {
		const s = JSON.parse(e.data)
		s.offset = Date.now() - s.now // Zeitunterschied Server <-> Browser
		onState(s)
	}
	if (onReady) es.addEventListener('ready', e => onReady(e.data))
}

function api(path, body) {
	return fetch('/api/' + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
}

// kleiner DOM-Helfer (textContent -> kein HTML aus Artikelnamen)
function el(tag, cls, ...kids) {
	const e = document.createElement(tag)
	if (cls) e.className = cls
	for (const k of kids) e.append(k)
	return e
}
