const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const keyNames = ['openai', 'anthropic', 'gemini', 'glm', 'youtube'];
const keys = () => JSON.parse(localStorage.getItem('physioai-keys') || '{}');
const esc = value => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

function setSection(id) { $$('.section').forEach(s => s.classList.toggle('active-section', s.id === id)); $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.section === id)); window.scrollTo({ top: 0, behavior: 'smooth' }); }
function openSettings() { keyNames.forEach(k => $(`[data-key="${k}"]`).value = keys()[k] || ''); $('#settings-modal').showModal(); }
function renderProviderCount() { const count = Object.values(keys()).filter(Boolean).length; $('#provider-count').textContent = count ? `${count} provider${count > 1 ? 's' : ''} connected` : 'No providers connected'; }

function renderNews(items) {
  const grid = $('#news-grid'); grid.innerHTML = '';
  items.slice(0, 6).forEach((item, i) => { const node = $('#news-template').content.cloneNode(true); const card = node.querySelector('.news-card'); card.classList.add(`news-card-${i+1}`); node.querySelector('.news-source').textContent = item.source || 'Medical news'; node.querySelector('.news-date').textContent = item.date ? new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Latest'; node.querySelector('h3').textContent = item.title; node.querySelector('p').textContent = item.description || 'A new update from the world of clinical research and health technology.'; node.querySelector('a').href = item.link || '#'; grid.append(node); });
}
async function loadNews() {
  $('#news-status').textContent = 'Refreshing the live medical feed…';
  try {
    const url = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent('https://www.sciencedaily.com/rss/health_medicine.xml');
    const r = await fetch(url); if (!r.ok) throw new Error('Feed unavailable'); const data = await r.json();
    const terms = /medical|health|clinical|ai|artificial intelligence|medicine|therapy|research/i;
    const items = data.items.filter(x => terms.test(`${x.title} ${x.description}`)).map(x => ({ source: 'ScienceDaily', title: x.title, description: x.description.replace(/<[^>]+>/g, '').slice(0, 170), date: x.pubDate, link: x.link }));
    if (!items.length) throw new Error('No relevant results'); renderNews(items); $('#news-status').textContent = 'Live feed · ScienceDaily health & medicine';
  } catch { renderNews(FALLBACK_NEWS); $('#news-status').textContent = 'Showing a curated reading list · Live feed may be temporarily unavailable'; }
}

async function callProvider(provider, prompt) {
  const k = keys()[provider]; if (!k) return null;
  if (provider === 'openai') { const r = await fetch('https://api.openai.com/v1/chat/completions', { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${k}`}, body:JSON.stringify({model:'gpt-4o-mini',messages:[{role:'system',content:'You are a careful physiotherapy education assistant. Do not diagnose. Be concise and evidence-aware.'},{role:'user',content:prompt}],temperature:.4}) }); if(!r.ok) throw new Error(`OpenAI: ${r.status}`); const d=await r.json(); return { name:'OpenAI', text:d.choices?.[0]?.message?.content }; }
  if (provider === 'anthropic') { const r = await fetch('https://api.anthropic.com/v1/messages', {method:'POST', headers:{'content-type':'application/json','x-api-key':k,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify({model:'claude-3-5-haiku-latest',max_tokens:700,system:'You are a careful physiotherapy education assistant. Do not diagnose.',messages:[{role:'user',content:prompt}]})}); if(!r.ok) throw new Error(`Anthropic: ${r.status}`); const d=await r.json(); return {name:'Claude', text:d.content?.[0]?.text}; }
  if (provider === 'gemini') { const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(k)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:`You are a careful physiotherapy education assistant. Do not diagnose.\n\n${prompt}`}]}]})}); if(!r.ok) throw new Error(`Gemini: ${r.status}`); const d=await r.json(); return {name:'Gemini',text:d.candidates?.[0]?.content?.parts?.[0]?.text}; }
  if (provider === 'glm') { const r=await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${k}`},body:JSON.stringify({model:'glm-4-flash',messages:[{role:'system',content:'You are a careful physiotherapy education assistant. Do not diagnose.'},{role:'user',content:prompt}]})}); if(!r.ok) throw new Error(`GLM: ${r.status}`); const d=await r.json(); return {name:'GLM',text:d.choices?.[0]?.message?.content}; }
}
function addChat(role, html) { const d=document.createElement('div'); d.className=`${role}-message`; d.innerHTML=html; $('#chat-log').append(d); $('#chat-log').scrollTop=$('#chat-log').scrollHeight; return d; }
async function askCouncil(prompt, target = null) {
  const active = keyNames.filter(k => k !== 'youtube' && keys()[k]);
  if (!active.length) { if (target) target.innerHTML='<p class="empty-callout">Connect at least one AI provider in Settings to generate this response.</p>'; else addChat('assistant','<span class="message-avatar">✦</span><div><b>Connect a provider</b><p>Open Settings to add an API key, then the council can respond.</p></div>'); return []; }
  if (!target) addChat('user', `<div><p>${esc(prompt)}</p></div>`);
  const loading = target || addChat('assistant', '<span class="message-avatar">✦</span><div><b>Council is considering</b><p>Consulting your connected providers…</p></div>');
  if (target) loading.innerHTML='<div class="loading-line"><span></span><span></span><span></span> Consulting your AI council…</div>';
  const responses = await Promise.allSettled(active.map(p => callProvider(p, prompt)));
  const good = responses.filter(x => x.status === 'fulfilled' && x.value?.text).map(x => x.value);
  const errors = responses.filter(x => x.status === 'rejected').map(x => x.reason.message);
  const content = good.length ? good.map(r => `<article class="council-response"><b>${r.name}</b><p>${esc(r.text).replace(/\n/g,'<br>')}</p></article>`).join('') : `<p class="empty-callout">No response returned. Check your API key, browser network access, and provider permissions.${errors.length ? ` (${esc(errors[0])})` : ''}</p>`;
  if (target) target.innerHTML=content; else loading.innerHTML=`<span class="message-avatar">✦</span><div><b>Council response</b><div class="council-responses">${content}</div></div>`;
  return good;
}

function renderBooks(level = 'BPT', query = '') { const q=query.toLowerCase().trim(); const records=BOOKS[level].filter(([s,b])=>`${s} ${b}`.toLowerCase().includes(q)); $('#book-library').innerHTML = records.length ? records.map(([subject, books],i)=>`<article class="book-row"><span class="book-num">${String(i+1).padStart(2,'0')}</span><div><h3>${subject}</h3><p>${books}</p></div><span class="book-arrow">↗</span></article>`).join('') : '<p class="empty-callout">No books match that search.</p>'; }
async function searchYoutube(topic) { const k=keys().youtube; if(!k) return ''; try { const r=await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&type=video&q=${encodeURIComponent(topic+' physiotherapy lecture')}&key=${encodeURIComponent(k)}`); const d=await r.json(); const id=d.items?.[0]?.id?.videoId; return id ? `<iframe title="Relevant YouTube lecture" src="https://www.youtube-nocookie.com/embed/${id}" allowfullscreen></iframe>` : ''; } catch { return ''; } }

document.addEventListener('DOMContentLoaded', () => {
  $$('.tab').forEach(b=>b.addEventListener('click',()=>setSection(b.dataset.section))); $$('[data-go]').forEach(b=>b.addEventListener('click',()=>setSection(b.dataset.go)));
  $$('.settings-trigger').forEach(b=>b.addEventListener('click',openSettings)); $('#close-settings').addEventListener('click',()=>$('#settings-modal').close());
  $('#settings-form').addEventListener('submit',e=>{e.preventDefault(); const next={}; keyNames.forEach(k=>next[k]=$(`[data-key="${k}"]`).value.trim()); localStorage.setItem('physioai-keys',JSON.stringify(next)); $('#settings-modal').close(); renderProviderCount();});
  $('#clear-keys').addEventListener('click',()=>{localStorage.removeItem('physioai-keys'); keyNames.forEach(k=>$(`[data-key="${k}"]`).value=''); renderProviderCount();});
  $('#refresh-news').addEventListener('click',loadNews); loadNews(); renderProviderCount();
  $('#council-form').addEventListener('submit',e=>{e.preventDefault();const q=$('#council-query').value.trim();if(q){$('#council-query').value='';askCouncil(q);}});
  $('#start-camera').addEventListener('click',GaitAnalysis.start); $('#stop-camera').addEventListener('click',GaitAnalysis.stop); $('#gait-tags').innerHTML=GAIT_PATTERNS.map(x=>`<span title="${x.cause}">${x.name}</span>`).join('');
  $('#assessment-form').addEventListener('submit',e=>{e.preventDefault();const findings=$('#assessment-findings').value.trim(), category=$('#assessment-category').value;if(!findings){$('#assessment-result').innerHTML='<p class="empty-callout">Add the clinical findings first.</p>';return;}askCouncil(`For an educational ${category} physiotherapy assessment, review these findings: ${findings}\n\nProvide: 1) key differential considerations with reasoning, 2) red flags / referral considerations, 3) objective assessment priorities, and 4) a staged physiotherapy plan. State limits and avoid definitive diagnosis.`, $('#assessment-result'));});
  $$('.library-level').forEach(b=>b.addEventListener('click',()=>{$$('.library-level').forEach(x=>x.classList.toggle('active',x===b));renderBooks(b.dataset.level,$('#book-search').value);})); $('#book-search').addEventListener('input',()=>renderBooks($('.library-level.active').dataset.level,$('#book-search').value)); renderBooks();
  $('#study-form').addEventListener('submit',async e=>{e.preventDefault();const topic=$('#study-topic').value.trim();if(!topic)return; const result=$('#study-result'); const responses=await askCouncil(`Create concise, well-structured physiotherapy study notes for: ${topic}. Include learning objectives, core concepts, clinical relevance, a compact revision checklist, 5 recall questions, and a 60-second educational video script. Keep it accurate and educational.`,result); if(responses.length){const video=await searchYoutube(topic); if(video) result.insertAdjacentHTML('beforeend',`<div class="video-embed"><b>Related lecture</b>${video}</div>`); else if(keys().youtube) result.insertAdjacentHTML('beforeend','<p class="youtube-note">No matching YouTube lecture was found.</p>'); else result.insertAdjacentHTML('beforeend','<p class="youtube-note">Add a YouTube API key in Settings to embed a relevant lecture.</p>');}});
});
