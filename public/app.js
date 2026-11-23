// gemeinsame Helfer für alle Seiten
const CHECK = '<svg viewBox="0 0 40 28" fill="none"><path d="M4.8 12.9L15.9 24 35.8 4" stroke="#80C587" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>'

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
