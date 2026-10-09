// TruckFlow assistant. Tries the AI backend (/api/chat). If that is not available
// (no server or no API key), it answers from simple built-in rules using the sample loads.
(() => {
  const T = window.TF, history = [];
  const fmt = l => `${l.pick} → ${l.drop}: ${l.miles} mi, $${l.pay.toLocaleString()} ($${(l.pay / l.miles).toFixed(2)}/mi), ${l.type}${l.away != null ? `, ${l.away} mi away` : ''}`;

  // Loads near a city mentioned in the message, or near the driver's search location
  function context(text) {
    const city = Object.keys(T.CITIES).find(c => text.toLowerCase().includes(c.split(',')[0].toLowerCase()));
    const location = city || T.getLf().loc;
    return { location, loads: T.findLoads({ loc: location, radius: '300', type: 'All', sort: 'near' }).list.slice(0, 6).map(fmt) };
  }

  function offline(text) {
    const t = text.toLowerCase(), c = context(text);
    const tk = Object.keys(T.TRUCKS).find(k => t.includes(k.toLowerCase()) || (T.TRUCKS[k].aka && t.includes(T.TRUCKS[k].aka.toLowerCase())));
    if (tk) { const k = T.TRUCKS[tk]; return `${tk}: ${k.len}. Weight limit: ${k.weight ? k.weight.toLocaleString() + ' lbs' : 'no trailer'}. Reference rate: ${k.rate ? '$' + k.rate[0] + '-$' + k.rate[1] + ' per mile' : 'not listed'} (examples only, not guaranteed).${k.note ? ' ' + k.note : ''}`; }
    if (/solo|team|hours|eld|legal miles|per day/.test(t)) return `Legal miles per day: about ${T.DAILY.Solo} for a solo driver (11 hours, 50-55 mph) and ${T.DAILY.Team.toLocaleString()} for team drivers. An ELD records driving hours under US hours-of-service rules.`;
    if (/complete|deliver(ed|y)|confirm/.test(t)) return 'Drivers only track the route and report arrival. A load is marked complete after the owner confirms it was delivered.';
    if (/guarantee|earn|income/.test(t)) return 'Nobody can guarantee loads, rates or earnings. Figures here are sample data only.';
    if (/free|fee|price|cost/.test(t)) return 'In this demo the first 5 completed loads are free. Pricing after that is not set yet.';
    if (/route|map|direction/.test(t)) return 'Choose a load, then open My Route and tap Open Maps for directions.';
    if (/rate|per mile|best/.test(t) && c.loads.length) {
      const best = T.findLoads({ loc: c.location, radius: '300', sort: 'rate' }).list.slice(0, 3).map(fmt);
      return `Best rate per mile near ${c.location} (sample data):\n` + best.join('\n');
    }
    if (/load|near|around|close|find|haul|pickup/.test(t))
      return c.loads.length ? `Nearest sample loads to ${c.location}:\n` + c.loads.slice(0, 3).join('\n') : `No sample loads within 300 miles of ${c.location}. Try Find Loads with a bigger distance.`;
    return 'I can help find loads near a city, compare rates per mile, or explain the demo. Try: "loads near Memphis".';
  }

  async function ask(text) {
    history.push({ role: 'user', content: text });
    let reply, ai = false;
    try {
      const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history.slice(-10), context: context(text) }) });
      if (!r.ok) throw 0;
      reply = (await r.json()).reply; ai = true;
    } catch { reply = offline(text); }
    history.push({ role: 'assistant', content: reply });
    return { reply, ai };
  }

  // ----- Chat window -----
  document.body.insertAdjacentHTML('beforeend', `
    <button id="tfBtn" aria-label="Open chat assistant">💬</button>
    <div id="tfBox" role="dialog" aria-label="Chat assistant">
      <div class="tf-head"><b>TruckFlow assistant</b><span id="tfMode">Basic mode</span></div>
      <div id="tfLog" aria-live="polite"></div>
      <div class="chips" style="padding:0 12px 8px">${['Loads near me', 'Best rate per mile', 'Truck types', 'Solo vs team'].map(q => `<button class="chip">${q}</button>`).join('')}</div>
      <div class="tf-form"><input id="tfIn" maxlength="300" placeholder="Ask about loads near a city" aria-label="Message"><button class="btn primary" id="tfSend">Send</button></div>
    </div>`);
  const log = document.getElementById('tfLog');
  const add = (text, me) => { const d = document.createElement('div'); d.className = 'tf-msg' + (me ? ' me' : ''); d.textContent = text; log.appendChild(d); log.scrollTop = log.scrollHeight; return d; };
  add('Hi! I can help you find loads near a city. I am an assistant, not a dispatcher, and the loads shown are sample data.');
  async function send(text) {
    text = text.trim(); if (!text) return;
    add(text, true); const wait = add('...');
    const { reply, ai } = await ask(text);
    wait.textContent = reply;
    document.getElementById('tfMode').textContent = ai ? 'AI' : 'Basic mode';
  }
  document.getElementById('tfBtn').onclick = () => document.getElementById('tfBox').classList.toggle('open');
  document.getElementById('tfSend').onclick = () => { const i = document.getElementById('tfIn'); send(i.value); i.value = ''; };
  document.getElementById('tfIn').onkeydown = e => { if (e.key === 'Enter') document.getElementById('tfSend').click(); };
  document.querySelectorAll('#tfBox .chip').forEach(b => b.onclick = () => send(b.textContent === 'Loads near me' ? 'Find loads near ' + T.getLf().loc : b.textContent === 'Truck types' ? 'Tell me about a dry van' : b.textContent));
})();
