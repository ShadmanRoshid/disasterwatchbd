/* ═══════════════════════════════════════════════════
   DisasterWatch BD — Application JavaScript
   ═══════════════════════════════════════════════════ */
'use strict';

// ════════════════════════════════════════════════
// PAGE NAVIGATION
// ════════════════════════════════════════════════
function showPage(name, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  if (btn) btn.classList.add('active');
  if (name === 'bluetooth') initBluetooth();
}

// ════════════════════════════════════════════════
// MAP (Leaflet)
// ════════════════════════════════════════════════
const VIEWS = {
  sylhet: { center: [24.8949, 91.8687], zoom: 11 },
  bd:     { center: [23.685, 90.356],   zoom: 7  }
};

const map = L.map('leaflet-map', {
  center: VIEWS.sylhet.center, zoom: VIEWS.sylhet.zoom,
  zoomControl: true, attributionControl: false
});
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);

const SYLHET = [24.8949, 91.8687];

const zoneCollapse = L.circle(SYLHET, { radius: 5000, color:'#E24B4A', fillColor:'#E24B4A', fillOpacity:0.18, weight:1.5 }).bindPopup('<b>🔴 Urban Collapse Zone</b><br>Extreme damage · 5km radius');
const zoneDamage   = L.circle(SYLHET, { radius: 9000, color:'#EF9F27', fillColor:'#EF9F27', fillOpacity:0.07, weight:1, dashArray:'8 4' }).bindPopup('<b>⚠ High Damage Zone</b>');
const zoneFlood    = L.circle(SYLHET, { radius:15000, color:'#378ADD', fillColor:'#378ADD', fillOpacity:0.05, weight:1, dashArray:'4 6' }).bindPopup('<b>🌊 Flood Zone</b>');
const surmaFlood   = L.circle([24.92, 91.87], { radius: 3000, color:'#378ADD', fillColor:'#378ADD', fillOpacity:0.35, weight:2 }).bindPopup('<b>🌊 Surma River Flooding</b>');
const haorZone     = L.circle([24.69, 92.12], { radius: 7000, color:'#378ADD', fillColor:'#378ADD', fillOpacity:0.12, weight:1, dashArray:'4 3' }).bindPopup('<b>💧 Hakaluki Haor</b>');

const faultLine = L.polyline([[25.12,89.5],[25.1,90],[25.07,90.5],[25.05,91],[25.03,91.5],[25,92],[24.97,92.5],[24.94,93]],
  { color:'#E24B4A', weight:2.5, dashArray:'10 5', opacity:0.75 }).bindPopup('<b>Dauki Fault Line</b>');

const epicenterIcon = L.divIcon({
  className: '',
  html: `<div style="position:relative;width:28px;height:28px;display:flex;align-items:center;justify-content:center"><div style="position:absolute;width:28px;height:28px;border-radius:50%;background:rgba(226,75,74,0.7);border:2px solid #E24B4A;animation:pulse 1.8s infinite"></div><div style="position:relative;z-index:1;color:#fff;font-size:10px;font-weight:bold;text-align:center;line-height:1.2">M<br>8.1</div></div>`,
  iconSize: [28,28], iconAnchor: [14,14]
});
const epicenterMarker = L.marker(SYLHET, { icon: epicenterIcon }).bindPopup('<b>🔴 EPICENTER — M 8.1</b>');
const mkAirport   = L.marker([24.9632,91.8677], { icon: L.divIcon({ className:'', html:'<div style="background:#fff;border:2px solid #3B82F6;border-radius:4px;padding:2px 6px;font-size:11px;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.2)">✈ OSS Airport</div>', iconAnchor:[35,10] }) }).bindPopup('<b>✈ Osmani International Airport</b><br>OPERATIONAL');
const mkHospital1 = L.marker([24.883,91.862], { icon: L.divIcon({ className:'', html:'<div style="background:#A32D2D;border:2px solid #E24B4A;border-radius:4px;padding:2px 6px;font-size:11px;color:#fff;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.2)">🏥 Osmani Med.</div>', iconAnchor:[42,10] }) }).bindPopup('<b>🏥 Osmani Medical College Hospital</b><br>⛔ NON-FUNCTIONAL');
const mkHospital2 = L.marker([24.86,91.87], { icon: L.divIcon({ className:'', html:'<div style="background:#3B6D11;border:2px solid #97C459;border-radius:4px;padding:2px 6px;font-size:11px;color:#fff;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.2)">🏥 Field Medical</div>', iconAnchor:[47,10] }) }).bindPopup('<b>🏥 Field Medical Post — Golapganj</b><br>✅ OPERATIONAL');
const mkLandslide = L.marker([25.01,92.1], { icon: L.divIcon({ className:'', html:'<div style="background:rgba(239,159,39,0.9);border-radius:4px;padding:2px 7px;font-size:11px;color:#fff;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.2)">⛰ Landslide Risk</div>', iconAnchor:[52,10] }) }).bindPopup('<b>⛰ Landslide Risk Zone</b>');
const mkSunamganj = L.marker([25.07,91.4], { icon: L.divIcon({ className:'', html:'<div style="background:rgba(239,159,39,0.9);border-radius:4px;padding:2px 7px;font-size:11px;color:#fff;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.2)">⚠ Sunamganj</div>', iconAnchor:[62,10] }) }).bindPopup('<b>⚠ Sunamganj</b><br>No road access · Army boats deployed');

const layerCircles = L.layerGroup([zoneCollapse, zoneDamage, zoneFlood, surmaFlood, haorZone]);
const layerDetails = L.layerGroup([mkAirport, mkHospital1, mkHospital2, mkLandslide, mkSunamganj, epicenterMarker]);
const layerFault   = L.layerGroup([faultLine]);

function updateLayersByZoom() {
  const z = map.getZoom();
  z >= 9  ? map.addLayer(layerCircles) : map.removeLayer(layerCircles);
  z >= 10 ? map.addLayer(layerDetails) : map.removeLayer(layerDetails);
  z >= 8  ? map.addLayer(layerFault)   : map.removeLayer(layerFault);
}
map.on('zoomend', updateLayersByZoom);
updateLayersByZoom();

function setView(mode, btn) {
  document.querySelectorAll('.map-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  map.flyTo(VIEWS[mode].center, VIEWS[mode].zoom, { duration: 1.2 });
}

// ════════════════════════════════════════════════
// REAL WEATHER via Open-Meteo (free, no key)
// Sylhet: lat=24.8949, lon=91.8687
// ════════════════════════════════════════════════
async function loadWeather() {
  const grid     = document.getElementById('weatherGrid');
  const statusEl = document.getElementById('weatherStatus');
  try {
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=24.8949&longitude=91.8687&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation,visibility,weather_code&wind_speed_unit=kmh&timezone=Asia%2FDhaka';
    const res  = await fetch(url);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    const c    = data.current;

    const windDir = compassDirection(c.wind_direction_10m);
    const wmoDesc = wmoToDesc(c.weather_code);
    const visKm   = c.visibility != null ? (c.visibility / 1000).toFixed(1) + ' km' : 'N/A';
    const precip  = c.precipitation != null ? c.precipitation.toFixed(1) + ' mm/h' : '0 mm/h';

    grid.innerHTML = `
      <div class="weather-grid">
        <div class="weather-cell"><div class="wlabel">Temp</div><div class="wval">${c.temperature_2m}°C</div></div>
        <div class="weather-cell"><div class="wlabel">Humidity</div><div class="wval">${c.relative_humidity_2m}%</div></div>
        <div class="weather-cell"><div class="wlabel">Wind</div><div class="wval">${c.wind_speed_10m} km/h ${windDir}</div></div>
        <div class="weather-cell"><div class="wlabel">Rain</div><div class="wval">${precip}</div></div>
        <div class="weather-cell"><div class="wlabel">Visibility</div><div class="wval">${visKm}</div></div>
        <div class="weather-cell"><div class="wlabel">Condition</div><div class="wval" style="font-size:10px">${wmoDesc}</div></div>
      </div>`;
    statusEl.textContent = '● LIVE';
    statusEl.style.color = '#3b6d11';
  } catch (err) {
    grid.innerHTML = `
      <div class="weather-grid">
        <div class="weather-cell"><div class="wlabel">Wind</div><div class="wval">87 km/h NE</div></div>
        <div class="weather-cell"><div class="wlabel">Rain</div><div class="wval">142mm/24h</div></div>
        <div class="weather-cell"><div class="wlabel">Temp</div><div class="wval">28°C</div></div>
        <div class="weather-cell"><div class="wlabel">Visibility</div><div class="wval">1.2 km</div></div>
      </div>`;
    statusEl.textContent = '(cached)';
  }
}

function compassDirection(deg) {
  const dirs = ['N','NE','E','SE','S','SW','W','NW'];
  return dirs[Math.round(deg / 45) % 8];
}

function wmoToDesc(code) {
  if (code == null) return 'Unknown';
  if (code === 0)   return 'Clear';
  if (code <= 3)    return 'Partly Cloudy';
  if (code <= 9)    return 'Fog';
  if (code <= 19)   return 'Drizzle';
  if (code <= 29)   return 'Rain';
  if (code <= 39)   return 'Snow';
  if (code <= 49)   return 'Fog';
  if (code <= 59)   return 'Drizzle';
  if (code <= 69)   return 'Rain';
  if (code <= 79)   return 'Snow';
  if (code <= 84)   return 'Rain Showers';
  if (code <= 94)   return 'Thunderstorm';
  return 'Heavy Storm';
}

loadWeather();
setInterval(loadWeather, 5 * 60 * 1000); // refresh every 5 min

// ════════════════════════════════════════════════
// UI HELPERS
// ════════════════════════════════════════════════
function toggleDropdown() {
  document.getElementById('profileDropdown').classList.toggle('open');
  document.getElementById('notifPanel').classList.remove('open');
}
function toggleNotif() {
  document.getElementById('notifPanel').classList.toggle('open');
  document.getElementById('profileDropdown').classList.remove('open');
  document.querySelector('.notif-badge').style.display = 'none';
}
function clearNotifs() {
  document.getElementById('notifPanel').innerHTML = '<div style="padding:20px 16px;font-size:12px;color:var(--text-muted);text-align:center">No new alerts</div>';
}
document.addEventListener('click', e => {
  if (!e.target.closest('.profile-wrap') && !e.target.closest('.notif-btn')) {
    document.getElementById('profileDropdown').classList.remove('open');
    document.getElementById('notifPanel').classList.remove('open');
  }
});
function openHelp()  { document.getElementById('helpModal').classList.add('open'); }
function closeHelp() { document.getElementById('helpModal').classList.remove('open'); }
document.getElementById('helpModal').addEventListener('click', e => { if (e.target === e.currentTarget) closeHelp(); });

// News filter
function filterNews(btn, cat) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.news-card').forEach(c => {
    c.style.display = (cat === 'all' || c.dataset.cat === cat) ? '' : 'none';
  });
}

// Vote
function handleVote(btn, delta) {
  const s = btn.querySelector('.count');
  s.textContent = parseInt(s.textContent.replace(',','')) + 1;
  btn.style.borderColor = delta > 0 ? 'var(--green)' : 'var(--red)';
  btn.style.color       = delta > 0 ? 'var(--green)' : 'var(--red)';
  btn.disabled = true;
}

// Rumor modal
let currentReportElement = null;
function openRumorModal(btn) {
  currentReportElement = btn.closest('.news-card');
  document.getElementById('rumorModal').classList.add('open');
}
function closeRumorModal() { document.getElementById('rumorModal').classList.remove('open'); }
document.getElementById('rumorModal').addEventListener('click', e => { if (e.target === e.currentTarget) closeRumorModal(); });

function submitRumor() {
  const text = document.getElementById('rumorText').value.trim();
  if (!text) return;
  const list = document.getElementById('rumorComments');
  const el   = document.createElement('div');
  el.className   = 'fake-comment';
  el.innerHTML   = `<strong>You:</strong> ${text}`;
  list.prepend(el);
  let cnt = parseInt(currentReportElement.getAttribute('data-rumors')) + 1;
  currentReportElement.setAttribute('data-rumors', cnt);
  currentReportElement.querySelector('.rcount').textContent = cnt;
  if (cnt >= 300) currentReportElement.classList.add('is-rumor');
  document.getElementById('rumorText').value = '';
  setTimeout(closeRumorModal, 300);
}

// Load more news
function loadMoreNews() {
  const grid  = document.getElementById('newsGrid');
  const cards = grid.querySelectorAll('.news-card');
  const src   = cards[Math.floor(Math.random() * cards.length)];
  const clone = src.cloneNode(true);
  clone.setAttribute('data-rumors', '0');
  clone.querySelector('.rcount').textContent = '0';
  clone.querySelector('.count').textContent  = '0';
  clone.classList.remove('is-rumor', 'featured');
  clone.style.gridColumn = '';
  grid.appendChild(clone);
}

// ════════════════════════════════════════════════
// AI CHAT — Anthropic API (Claude)
// ════════════════════════════════════════════════
let chatOpen    = false;
let chatHistory = [];
let aiTyping    = false;

const AI_SYSTEM_PROMPT = `You are an emergency response AI assistant for DisasterWatch BD — a disaster monitoring platform for Bangladesh. You are helping people during a major emergency: an M8.1 earthquake in Sylhet Division with flooding, aftershocks, and a potential cyclone.

Key facts you know:
- Emergency numbers: 999 (national), 01730-336699 (BDRCS), 199 (fire), 156 (coast guard), 02-9557091 (DDM)
- Osmani Medical College Hospital is NON-FUNCTIONAL due to flooding
- Operational: Field Medical Camp Golapganj, Army Medical Unit Beanibazar, Air Evacuation at Osmani Airport (critical only)
- Open shelters: Beanibazar Govt College SY-14 (1,400 cap, 67% full, 34km east), Companiganj Model School SY-31 (600 cap, 36% full, 42km NE via N2)
- Near-full: Fenchuganj Technical School SY-22 (94% full)
- Army boats at Khadim Nagar Ghat for flood rescue
- Flood evacuation: head north on N2 toward Sunamganj, avoid Surma bridges
- Surma River has breached 3 embankments; over 50 villages flooded
- Army rescue boats deployed to Sunamganj district
- Cyclone watch active for Bay of Bengal / Chattogram coast

Be concise, practical, and calm. Prioritize life-safety information. Respond in 2-4 sentences max unless a detailed procedure is needed. If someone seems to be in immediate danger, lead with the most critical action first.`;

function toggleChat() {
  chatOpen = !chatOpen;
  document.getElementById('chatWindow').classList.toggle('open', chatOpen);
  if (chatOpen) {
    document.getElementById('chatNotifBadge').style.display = 'none';
    document.getElementById('chatInput').focus();
  }
}

function addMessage(text, type) {
  const b = document.getElementById('chatMessages');
  const timeStr = new Date().toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
  const d = document.createElement('div');
  d.className = 'msg ' + type;
  d.innerHTML = `<div>${text}</div><div class="msg-time">${timeStr}</div>`;
  b.appendChild(d);
  b.scrollTop = b.scrollHeight;
  return d;
}

function showTypingIndicator() {
  const b = document.getElementById('chatMessages');
  const d = document.createElement('div');
  d.className = 'msg typing';
  d.id = 'typingIndicator';
  d.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
  b.appendChild(d);
  b.scrollTop = b.scrollHeight;
}

function removeTypingIndicator() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

async function callClaudeAPI(userMessage) {
  chatHistory.push({ role: 'user', content: userMessage });
  showTypingIndicator();
  document.getElementById('chatSendBtn').disabled = true;
  aiTyping = true;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        system: AI_SYSTEM_PROMPT,
        messages: chatHistory
      })
    });

    const data  = await response.json();
    const reply = data.content?.[0]?.text || 'I am currently unable to respond. Please call 999 for immediate emergency assistance.';
    chatHistory.push({ role: 'assistant', content: reply });
    removeTypingIndicator();
    addMessage(reply, 'bot');
  } catch (err) {
    removeTypingIndicator();
    // Fallback to hardcoded responses if API unavailable
    const fallbacks = [
      'Nearest open shelter: Beanibazar Govt. College SY-14 (34km east, 67% capacity). Route is clear. Call 999 for transport assistance.',
      'Flood evacuation: Move north on N2. Avoid all Surma River bridges. Army boats available at Khadim Nagar Ghat.',
      'Emergency: 999 (national) | 01730-336699 (BDRCS) | 199 (fire) | 156 (coast guard). If no signal, use the Mesh Network tab.',
      'During aftershock: Drop, cover your head, hold on. Do not run outside until shaking stops. Stay away from windows and damaged walls.',
      'Osmani Hospital is non-functional. Go to: Field Medical Golapganj ✅, Army Unit Beanibazar ✅, or Osmani Airport for air evac (critical only).'
    ];
    const reply = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    chatHistory.push({ role: 'assistant', content: reply });
    addMessage(reply, 'bot');
  } finally {
    aiTyping = false;
    document.getElementById('chatSendBtn').disabled = false;
    document.getElementById('chatInput').focus();
  }
}

function sendChat() {
  const input = document.getElementById('chatInput');
  const text  = input.value.trim();
  if (!text || aiTyping) return;
  addMessage(text, 'user');
  input.value = '';
  callClaudeAPI(text);
}

function sendQuick(text) {
  if (aiTyping) return;
  if (!chatOpen) toggleChat();
  addMessage(text, 'user');
  callClaudeAPI(text);
}

// ════════════════════════════════════════════════
// BLUETOOTH MESH NETWORK
// ════════════════════════════════════════════════
const myNode = { id:'BD-7741', name:'You (BD-7741)', color:'#3B6D11', emoji:'👤' };

let meshNodes = [
  { id:'BD-3892', name:'Rashida B.', color:'#0066CC', emoji:'👩', connected:true,  rssi:-62, hops:1, msgs:8  },
  { id:'BD-5521', name:'Karim M.',   color:'#7C3AED', emoji:'👨', connected:true,  rssi:-74, hops:1, msgs:12 },
  { id:'BD-9011', name:'Noor F.',    color:'#854F0B', emoji:'👩', connected:true,  rssi:-81, hops:2, msgs:7  },
  { id:'BD-2234', name:'ARMY-01',    color:'#A32D2D', emoji:'🪖', connected:false, rssi:-91, hops:3, msgs:0  }
];

let meshMessages = [
  { sender:'BD-3892', name:'Rashida B.', text:'I am at the school roof. Water still rising. Need boat.',              time:'06:14', mine:false },
  { sender:'BD-5521', name:'Karim M.',   text:'Army boat coming to Khadim Ghat. Spread the word.',                    time:'06:21', mine:false },
  { sender:myNode.id, name:'You',        text:'Confirmed. I relayed to 3 devices further in the mesh.',               time:'06:22', mine:true  },
  { sender:'BD-9011', name:'Noor F.',    text:'Anyone near Goalpara? My family is trapped.',                          time:'06:35', mine:false }
];

let scanning       = true;
let btInitialized  = false;
let animFrame;
let canvasNodes    = [];

function initBluetooth() {
  if (btInitialized) { renderDeviceList(); renderMeshMessages(); renderMeshAvatars(); return; }
  btInitialized = true;
  renderDeviceList();
  renderMeshMessages();
  renderMeshAvatars();
  setTimeout(() => initCanvas(), 100);
  startNetworkGrowth();
}

function renderMeshAvatars() {
  const connected = meshNodes.filter(n => n.connected);
  document.getElementById('meshAvatars').innerHTML = connected.slice(0,4).map(
    n => `<div class="mesh-avatar" style="background:${n.color}" title="${n.name}">${n.emoji}</div>`
  ).join('');
  document.getElementById('meshOnlineLabel').textContent = connected.length + ' peers online';
}

function renderDeviceList() {
  const list = document.getElementById('deviceList');
  list.innerHTML = '';
  meshNodes.forEach(node => {
    const div = document.createElement('div');
    div.className = 'bt-device';
    div.innerHTML = `
      <div class="bt-device-icon ${node.connected ? 'peer' : 'new'}">${node.emoji}</div>
      <div class="bt-device-info">
        <div class="bt-device-name">${node.name}</div>
        <div class="bt-device-meta">${node.id} · ${node.rssi}dBm ${rssiBar(node.rssi)} · ${node.hops} hop${node.hops > 1 ? 's' : ''}</div>
      </div>
      <div class="bt-device-action">
        ${node.connected
          ? `<button class="bt-btn msg" onclick="focusMeshChat()">💬 MSG</button><button class="bt-btn danger" onclick="disconnectNode('${node.id}')">✕</button>`
          : `<button class="bt-btn connect" onclick="connectNode('${node.id}')">+ CONNECT</button>`}
      </div>`;
    list.appendChild(div);
  });
  document.getElementById('deviceCountLabel').textContent = meshNodes.length + ' FOUND';
}

function rssiBar(rssi) {
  const pct   = Math.max(0, Math.min(100, (rssi + 100) * 2));
  const color = pct > 60 ? '#3B6D11' : pct > 30 ? '#EF9F27' : '#E24B4A';
  return `<span style="display:inline-block;width:30px;height:4px;background:#eee;border-radius:2px;vertical-align:middle;overflow:hidden"><span style="display:block;height:100%;width:${pct}%;background:${color};border-radius:2px"></span></span>`;
}

function connectNode(id) {
  const node = meshNodes.find(n => n.id === id);
  if (!node) return;
  node.connected = true;
  renderDeviceList(); renderMeshAvatars(); updateStats();
  addMeshMessage({ sender:id, name:node.name, text:`Connected to your mesh. Now relaying messages. 📡`, time:now(), mine:false, system:true });
  drawCanvas();
}

function disconnectNode(id) {
  const node = meshNodes.find(n => n.id === id);
  if (!node) return;
  node.connected = false;
  renderDeviceList(); renderMeshAvatars(); updateStats(); drawCanvas();
}

function focusMeshChat() { document.getElementById('meshInput').focus(); }

function updateStats() {
  const connected = meshNodes.filter(n => n.connected).length;
  document.getElementById('peerCount').textContent    = connected;
  document.getElementById('dashPeerCount').textContent = meshNodes.length;
  document.getElementById('meshOnlineLabel').textContent = connected + ' peers online';
}

function toggleScan() {
  scanning = !scanning;
  const btn   = document.getElementById('scanBtn');
  const badge = document.getElementById('scanBadge');
  if (scanning) {
    btn.textContent   = '⏹ Stop Scan';
    btn.classList.add('scanning');
    badge.textContent = '● Scanning';
    badge.className   = 'bt-badge scanning';
    setTimeout(() => {
      if (!meshNodes.find(n => n.id === 'BD-6677')) {
        meshNodes.push({ id:'BD-6677', name:'Fatema K.', color:'#065F46', emoji:'👩', connected:false, rssi:-88, hops:3, msgs:0 });
        renderDeviceList();
        document.getElementById('networkSize').textContent = parseInt(document.getElementById('networkSize').textContent) + 1;
        addMeshMessage({ sender:'system', name:'System', text:'📡 New device discovered: Fatema K. (BD-6677) — 3 hops away', time:now(), mine:false, system:true });
      }
    }, 3000);
  } else {
    btn.textContent   = '🔍 Scan for Devices';
    btn.classList.remove('scanning');
    badge.textContent = '● Connected';
    badge.className   = 'bt-badge connected';
  }
}

function renderMeshMessages() {
  const container = document.getElementById('meshMessages');
  container.innerHTML = '';
  meshMessages.forEach(m => addMeshMessageDOM(m, container));
  container.scrollTop = container.scrollHeight;
}

function addMeshMessage(msg) {
  meshMessages.push(msg);
  const container = document.getElementById('meshMessages');
  addMeshMessageDOM(msg, container);
  container.scrollTop = container.scrollHeight;
  document.getElementById('msgCount').textContent = parseInt(document.getElementById('msgCount').textContent) + 1;
}

function addMeshMessageDOM(msg, container) {
  const div = document.createElement('div');
  div.className = 'mesh-msg ' + (msg.mine ? 'mine' : 'theirs');
  if (msg.system) {
    div.style.cssText = 'align-self:center;max-width:90%';
    div.innerHTML = `<div style="font-family:'Space Mono',monospace;font-size:9px;color:var(--text-muted);background:var(--surface2);padding:6px 12px;border-radius:20px;text-align:center">${msg.text}</div>`;
  } else if (msg.img) {
    div.innerHTML = `
      ${!msg.mine ? `<div class="mesh-msg-sender">${msg.name} · ${msg.time}</div>` : ''}
      <div class="mesh-msg-bubble" style="${msg.mine ? '' : 'padding:6px'}">
        <img src="${msg.img}" class="mesh-msg-img" alt="Shared image" onclick="viewImg('${msg.img}')">
        ${msg.caption ? `<div style="font-size:11px;margin-top:4px">${msg.caption}</div>` : ''}
      </div>
      <div class="mesh-msg-time">${msg.mine ? 'You · ' : ''}${msg.time}${msg.mine ? ' ✓✓' : ''}</div>`;
  } else {
    div.innerHTML = `
      ${!msg.mine ? `<div class="mesh-msg-sender">${msg.name} · ${msg.time}</div>` : ''}
      <div class="mesh-msg-bubble">${msg.text}</div>
      <div class="mesh-msg-time">${msg.mine ? 'You · ' : ''}${msg.time}${msg.mine ? ' ✓✓' : ''}</div>`;
  }
  container.appendChild(div);
}

function sendMeshMsg() {
  const input = document.getElementById('meshInput');
  const text  = input.value.trim();
  if (!text) return;
  addMeshMessage({ sender:myNode.id, name:'You', text, time:now(), mine:true });
  input.value = '';
  // Simulate peer reply
  const connected = meshNodes.filter(n => n.connected);
  if (connected.length > 0) {
    const peer = connected[Math.floor(Math.random() * connected.length)];
    const replies = [
      'Understood. Passing message to my 2 connected devices.',
      'Copy that. Relaying further into the mesh.',
      'Got it. Is there anything we can help with?',
      'Message received. Stay safe everyone.',
      'Confirmed. Army is aware of the situation.'
    ];
    setTimeout(() => {
      addMeshMessage({ sender:peer.id, name:peer.name, text:replies[Math.floor(Math.random() * replies.length)], time:now(), mine:false });
    }, 1200 + Math.random() * 1500);
  }
}

function sendImage(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    addMeshMessage({ sender:myNode.id, name:'You', img:e.target.result, caption:'📍 Situation photo', time:now(), mine:true });
    const connected = meshNodes.filter(n => n.connected);
    if (connected.length > 0) {
      setTimeout(() => addMeshMessage({ sender:connected[0].id, name:connected[0].name, text:'Photo received. Forwarding to rescue team.', time:now(), mine:false }), 1800);
    }
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function viewImg(src) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;cursor:pointer';
  overlay.innerHTML = `<img src="${src}" style="max-width:90vw;max-height:90vh;border-radius:8px">`;
  overlay.onclick = () => document.body.removeChild(overlay);
  document.body.appendChild(overlay);
}

function now() {
  return new Date().toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
}

function startNetworkGrowth() {
  setInterval(() => {
    const size = parseInt(document.getElementById('networkSize').textContent);
    if (Math.random() > 0.4 && size < 50) {
      document.getElementById('networkSize').textContent = size + 1;
      const hopEl = document.getElementById('hopCount');
      if (Math.random() > 0.7) hopEl.textContent = Math.min(parseInt(hopEl.textContent) + 1, 8);
    }
  }, 4000);
}

// ════════════════════════════════════════════════
// CANVAS NETWORK VISUALIZATION
// ════════════════════════════════════════════════
function initCanvas() {
  const canvas = document.getElementById('networkCanvas');
  if (!canvas) return;
  const container = canvas.parentElement;
  canvas.width  = container.offsetWidth;
  canvas.height = container.offsetHeight;
  buildCanvasNodes(canvas);
  drawCanvas();
}

function buildCanvasNodes(canvas) {
  const cx = canvas.width / 2, cy = canvas.height / 2;
  canvasNodes = [
    { x:cx,     y:cy,     label:'YOU',     color:'#3B6D11', r:18, connected:true,  self:true },
    { x:cx-90,  y:cy-60,  label:'Rashida', color:'#0066CC', r:13, connected:true  },
    { x:cx+80,  y:cy-70,  label:'Karim',   color:'#7C3AED', r:13, connected:true  },
    { x:cx-70,  y:cy+75,  label:'Noor',    color:'#854F0B', r:13, connected:true  },
    { x:cx+100, y:cy+55,  label:'ARMY',    color:'#A32D2D', r:11, connected:false },
    { x:cx-160, y:cy-30,  label:'BD-?',    color:'#999',    r:9,  connected:false, dim:true },
    { x:cx-130, y:cy+110, label:'BD-?',    color:'#999',    r:9,  connected:false, dim:true },
    { x:cx+160, y:cy-20,  label:'BD-?',    color:'#999',    r:9,  connected:false, dim:true },
    { x:cx-50,  y:cy-130, label:'BD-?',    color:'#999',    r:9,  connected:false, dim:true }
  ];
}

function drawCanvas() {
  const canvas = document.getElementById('networkCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const self  = canvasNodes[0];
  const peers = canvasNodes.slice(1, 5);
  const dims  = canvasNodes.slice(5);

  // Peer connections
  peers.forEach(n => {
    if (n.connected) {
      ctx.beginPath(); ctx.moveTo(self.x, self.y); ctx.lineTo(n.x, n.y);
      ctx.strokeStyle = n.color + '66'; ctx.lineWidth = 2; ctx.setLineDash([]); ctx.stroke();
    }
  });

  // 2nd-hop dim connections
  [[1,5],[1,6],[2,7],[0,8]].forEach(([a,b]) => {
    if (canvasNodes[a] && canvasNodes[b]) {
      ctx.beginPath(); ctx.moveTo(canvasNodes[a].x, canvasNodes[a].y); ctx.lineTo(canvasNodes[b].x, canvasNodes[b].y);
      ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 1; ctx.setLineDash([4,4]); ctx.stroke(); ctx.setLineDash([]);
    }
  });

  // Pulse rings on self
  const t = Date.now() / 1000;
  for (let i = 0; i < 3; i++) {
    const phase = (t * 0.5 + i / 3) % 1;
    const r     = self.r + phase * 40;
    const alpha = (1 - phase) * 0.3;
    ctx.beginPath(); ctx.arc(self.x, self.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(59,109,17,${alpha})`; ctx.lineWidth = 1.5; ctx.stroke();
  }

  // Draw peer + dim nodes
  [...peers, ...dims].forEach(n => {
    ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fillStyle = n.connected ? n.color : n.color + '44'; ctx.fill();
    if (!n.dim) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); }
    ctx.fillStyle = n.dim ? '#aaa' : '#333';
    ctx.font = `${n.dim ? 8 : 9}px "Space Mono", monospace`;
    ctx.textAlign = 'center'; ctx.fillText(n.label, n.x, n.y + n.r + 12);
  });

  // Draw self node
  ctx.beginPath(); ctx.arc(self.x, self.y, self.r, 0, Math.PI * 2);
  ctx.fillStyle = self.color; ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 9px "Space Mono", monospace';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('YOU', self.x, self.y);
  ctx.textBaseline = 'alphabetic';

  animFrame = requestAnimationFrame(drawCanvas);
}

window.addEventListener('resize', () => {
  if (btInitialized) { cancelAnimationFrame(animFrame); initCanvas(); }
});

// ════════════════════════════════════════════════
// SOCKET.IO — Progressive Enhancement
// If a backend with Socket.io is running at the
// same origin, we connect and use real messages.
// Otherwise, the simulation runs fine standalone.
// ════════════════════════════════════════════════
function trySocketIO() {
  if (typeof io === 'undefined') return; // no server running

  const socket = io({ reconnectionAttempts: 3 });
  const badge  = document.getElementById('socketStatusBadge');

  socket.on('connect', () => {
    badge.textContent = 'LIVE';
    badge.classList.add('live');
    socket.emit('join', { id: myNode.id, name: 'You (BD-7741)' });
  });

  socket.on('disconnect', () => {
    badge.textContent = 'OFFLINE';
    badge.classList.remove('live');
  });

  socket.on('mesh:message', msg => {
    if (msg.sender === myNode.id) return; // echo prevention
    addMeshMessage({ sender: msg.sender, name: msg.name, text: msg.text, time: now(), mine: false });
  });

  socket.on('mesh:join', info => {
    addMeshMessage({ sender:'system', name:'System', text:`📡 ${info.name} joined the mesh`, time:now(), mine:false, system:true });
    if (!meshNodes.find(n => n.id === info.id)) {
      meshNodes.push({ id:info.id, name:info.name, color:'#0066CC', emoji:'👤', connected:true, rssi:-75, hops:1, msgs:0 });
      if (btInitialized) renderDeviceList();
    }
  });

  socket.on('mesh:peers', count => {
    document.getElementById('networkSize').textContent = count;
  });

  // Override sendMeshMsg to also emit when socket is live
  const originalSend = window.sendMeshMsg;
  window.sendMeshMsg = function() {
    const input = document.getElementById('meshInput');
    const text  = input.value.trim();
    if (!text) return;
    addMeshMessage({ sender:myNode.id, name:'You', text, time:now(), mine:true });
    input.value = '';
    socket.emit('mesh:message', { sender:myNode.id, name:'You (BD-7741)', text });
  };
}

// Attempt socket connection (will silently fail if no backend)
trySocketIO();
