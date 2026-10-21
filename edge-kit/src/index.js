import qrcode from 'qrcode-generator'

const HOST_SHORT = 'short.sgyyyds.qzz.io'
const HOST_PASTE = 'paste.sgyyyds.qzz.io'
const HOST_NODES = 'nodes.sgyyyds.qzz.io'
const HOST_QR = 'qr.sgyyyds.qzz.io'
const HOST_PROXY = 'px.sgyyyds.qzz.io'
const HOST_IP = 'ip.sgyyyds.qzz.io'
const HOST_CHECK = 'check.sgyyyds.qzz.io'

const enc = new TextEncoder()

function b64url(bytes) {
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function shortId(url) {
  const d = await crypto.subtle.digest('SHA-256', enc.encode(url))
  return b64url(new Uint8Array(d).slice(0, 6))
}

const PAGE = (title, body) => `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<style>
:root{color-scheme:dark}
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0a0c0d;color:#e7ecef;
font:14px/1.6 ui-sans-serif,system-ui,"Noto Sans SC",sans-serif}
main{width:min(680px,92vw);padding:28px;border:1px solid #1e2427;border-radius:10px;background:#101416}
h1{font-size:18px;margin:0 0 4px}
p.sub{margin:0 0 20px;color:#8b979d;font-size:12px}
label{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#8b979d;margin:14px 0 6px}
input,textarea{width:100%;box-sizing:border-box;background:#0a0c0d;border:1px solid #1e2427;border-radius:6px;
color:#e7ecef;padding:9px 11px;font:13px/1.5 ui-monospace,monospace}
textarea{min-height:150px;resize:vertical}
button{margin-top:16px;background:#35d07f;color:#04140c;border:0;border-radius:6px;padding:9px 18px;
font-weight:600;font-size:13px;cursor:pointer}
button:hover{opacity:.88}
.out{margin-top:16px;padding:11px;border:1px dashed #2b3438;border-radius:6px;font:12px/1.6 ui-monospace,monospace;
word-break:break-all;color:#35d07f}
a{color:#35d07f}
code{color:#9fe8c4}
</style></head><body><main>${body}</main></body></html>`

function home() {
  return PAGE('Atlas Edge Kit', `
<h1>Atlas Edge Kit</h1>
<p class="sub">跑在 Cloudflare 边缘的小工具 · KV 存储 · 无需服务器</p>
<label>短链目标 URL</label>
<input id="u" placeholder="https://example.com/some/long/path">
<button onclick="mk()">生成短链</button>
<div class="out" id="o" hidden></div>
<script>
async function mk(){
  const u=document.getElementById('u').value.trim(); if(!u) return
  const r=await fetch('/api/shorten',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({url:u})})
  const j=await r.json(); const o=document.getElementById('o')
  o.hidden=false; o.innerHTML = j.error ? ('错误: '+j.error) :
    ('短链: <a href="'+j.short+'" target="_blank">'+j.short+'</a><br>原始: '+j.url+'<br>统计: <a href="'+j.stats+'" target="_blank">'+j.stats+'</a>')
}
</script>`)
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const host = url.hostname

    if (host === HOST_SHORT) {
      if (url.pathname === '/api/shorten' && request.method === 'POST') {
        let body
        try { body = await request.json() } catch { return json({ error: 'invalid json' }, 400) }
        const target = (body.url || '').trim()
        if (!/^https?:\/\//i.test(target)) return json({ error: '需要 http(s):// 开头的 URL' }, 400)
        const id = await shortId(target)
        await env.ATLAS_KV.put(`short:${id}`, JSON.stringify({ url: target, at: Date.now() }), { metadata: { url: target } })
        return json({ short: `https://${HOST_SHORT}/${id}`, url: target, stats: `https://${HOST_SHORT}/stats/${id}` })
      }
      if (url.pathname === '/api/list') {
        const list = await env.ATLAS_KV.list({ prefix: 'short:' })
        return json({ count: list.keys.length, keys: list.keys.map((k) => `https://${HOST_SHORT}/${k.name.slice(6)}`) })
      }
      if (url.pathname.startsWith('/stats/')) {
        const id = url.pathname.slice(7)
        const raw = await env.ATLAS_KV.get(`short:${id}`)
        if (!raw) return json({ error: 'not found' }, 404)
        const hits = Number((await env.ATLAS_KV.get(`hits:${id}`)) || '0')
        return json({ id, ...JSON.parse(raw), hits })
      }
      const m = url.pathname.match(/^\/([A-Za-z0-9_-]{4,32})$/)
      if (m) {
        const id = m[1]
        const raw = await env.ATLAS_KV.get(`short:${id}`)
        if (!raw) return new Response(PAGE('未找到', '<h1>404</h1><p class="sub">短链不存在</p><p><a href="/">回首页</a></p>'), { status: 404, headers: { 'content-type': 'text/html;charset=utf-8' } })
        const hits = Number((await env.ATLAS_KV.get(`hits:${id}`)) || '0') + 1
        await env.ATLAS_KV.put(`hits:${id}`, String(hits))
        return Response.redirect(JSON.parse(raw).url, 302)
      }
      return new Response(home(), { headers: { 'content-type': 'text/html;charset=utf-8' } })
    }


const NODE_SOURCES = [
  { name: 'Epodonios/v2ray-configs · vless', url: 'https://raw.githubusercontent.com/Epodonios/v2ray-configs/main/Splitted-By-Protocol/vless.txt' },
  { name: 'Epodonios/v2ray-configs · vmess', url: 'https://raw.githubusercontent.com/Epodonios/v2ray-configs/main/Splitted-By-Protocol/vmess.txt' },
  { name: 'Epodonios/v2ray-configs · trojan', url: 'https://raw.githubusercontent.com/Epodonios/v2ray-configs/main/Splitted-By-Protocol/trojan.txt' },
  { name: 'Epodonios/v2ray-configs · ss', url: 'https://raw.githubusercontent.com/Epodonios/v2ray-configs/main/Splitted-By-Protocol/ss.txt' },
  { name: 'mahdibland/V2RayAggregator', url: 'https://raw.githubusercontent.com/mahdibland/V2RayAggregator/master/Eternity.txt' },
  { name: 'peasoft/NoMoreWalls', url: 'https://raw.githubusercontent.com/peasoft/NoMoreWalls/master/list.txt' },
  { name: 'ermaozi/get_subscribe', url: 'https://raw.githubusercontent.com/ermaozi/get_subscribe/main/subscribe/v2ray.txt' },
  { name: 'freefq/free', url: 'https://raw.githubusercontent.com/freefq/free/master/v2' },
  { name: 'barry-far/V2ray-Config', url: 'https://raw.githubusercontent.com/barry-far/V2ray-Config/main/All_Configs_Sub.txt' },
  { name: 'aiboboxx/v2rayfree', url: 'https://raw.githubusercontent.com/free-nodes/v2rayfree/main/v20261020' },
  { name: 'Pawdroid/Free-servers', url: 'https://raw.githubusercontent.com/Pawdroid/Free-servers/main/sub' },
]

const NODE_CACHE_KEY = 'nodes:cache:v1'
const NODE_TTL_MS = 30 * 60 * 1000
const SCHEMES = ['vless://', 'vmess://', 'trojan://', 'ss://', 'ssr://', 'hysteria2://', 'hy2://', 'tuic://']

function scanNodeLines(text, out) {
  for (const line of text.split(/\r?\n/)) {
    const v = line.trim()
    if (!v || v.startsWith('#')) continue
    if (SCHEMES.some((s) => v.toLowerCase().startsWith(s))) out.push(v)
  }
}

function b64decodeUtf8(body) {
  const clean = body.replace(/\s+/g, '')
  if (!clean || clean.length % 4 === 1 || !/^[A-Za-z0-9+/_-]+=*$/.test(clean)) return null
  try {
    const bin = atob(clean.replace(/-/g, '+').replace(/_/g, '/'))
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
    const text = new TextDecoder().decode(bytes)
    return text.includes('://') ? text : null
  } catch {
    return null
  }
}

function extractNodes(text) {
  const out = []
  scanNodeLines(text, out)
  // 部分上游(如 Epodonios 的分协议文件)整份以 Base64 打包,解开后再扫一遍。
  if (out.length === 0) {
    const decoded = b64decodeUtf8(text)
    if (decoded) scanNodeLines(decoded, out)
  }
  return out
}

function b64encodeUtf8(str) {
  const bytes = enc.encode(str)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}

async function collectNodes(env) {
  const cached = await env.ATLAS_KV.get(NODE_CACHE_KEY)
  if (cached) {
    const parsed = JSON.parse(cached)
    if (Date.now() - parsed.at < NODE_TTL_MS) return { ...parsed, cached: true }
  }
  const results = await Promise.all(NODE_SOURCES.map(async (src) => {
    try {
      const r = await fetch(src.url, { cf: { cacheTtl: 600, cacheEverything: true } })
      if (!r.ok) return { ...src, ok: false, count: 0, nodes: [] }
      const nodes = extractNodes(await r.text())
      return { ...src, ok: true, count: nodes.length, nodes }
    } catch {
      return { ...src, ok: false, count: 0, nodes: [] }
    }
  }))
  const seen = new Set()
  const merged = []
  for (const r of results) for (const n of r.nodes) if (!seen.has(n)) { seen.add(n); merged.push(n) }
  const payload = {
    at: Date.now(),
    total: merged.length,
    sources: results.map(({ name, url, ok, count }) => ({ name, url, ok, count })),
    nodes: merged,
  }
  await env.ATLAS_KV.put(NODE_CACHE_KEY, JSON.stringify(payload))
  return { ...payload, cached: false }
}

function nodesHome(view) {
  const rows = view.sources.map((s) => `<tr><td>${s.name}</td><td style="color:${s.ok ? '#35d07f' : '#e06c75'}">${s.ok ? s.count : 'FAIL'}</td><td><a href="${s.url}" target="_blank">源</a></td></tr>`).join('')
  const age = Math.max(0, Math.round((Date.now() - view.at) / 1000))
  return PAGE('Atlas Nodes', `
<h1>Atlas Nodes</h1>
<p class="sub">免费节点聚合订阅 · 跑在 Cloudflare 边缘 · 30 分钟自动刷新缓存</p>
<label>合并订阅(基础 Base64)</label>
<input value="https://${HOST_NODES}/sub" readonly onclick="this.select()">
<label>明文节点列表</label>
<input value="https://${HOST_NODES}/txt" readonly onclick="this.select()">
<div class="out">共 <code>${view.total}</code> 个去重节点 · 缓存于 ${age}s 前${view.cached ? '(命中缓存)' : '(本次刷新)'}</div>
<label>上游来源</label>
<table style="width:100%;border-collapse:collapse;font-size:12px"><tbody>
${rows}
</tbody></table>
<style>td{padding:5px 8px;border-bottom:1px solid #1e2427;color:#b8c2c7}</style>`)
}

const PROXY_SOURCES = [
  { name: 'TheSpeedX/PROXY-List · http', url: 'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt', kind: 'http' },
  { name: 'TheSpeedX/PROXY-List · socks4', url: 'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks4.txt', kind: 'socks4' },
  { name: 'TheSpeedX/PROXY-List · socks5', url: 'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks5.txt', kind: 'socks5' },
  { name: 'monosans/proxy-list · http', url: 'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt', kind: 'http' },
  { name: 'monosans/proxy-list · socks4', url: 'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/socks4.txt', kind: 'socks4' },
  { name: 'monosans/proxy-list · socks5', url: 'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/socks5.txt', kind: 'socks5' },
  { name: 'ShiftyTR/Proxy-List · http', url: 'https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/http.txt', kind: 'http' },
  { name: 'ShiftyTR/Proxy-List · socks4', url: 'https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/socks4.txt', kind: 'socks4' },
  { name: 'ShiftyTR/Proxy-List · socks5', url: 'https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/socks5.txt', kind: 'socks5' },
  { name: 'monosans/proxy-list · json(带国家/ASN)', url: 'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies.json', kind: 'json' },
]

const PROXY_CACHE_KEY = 'proxy:cache:v1'
const PROXY_TTL_MS = 10 * 60 * 1000
const PROXY_LINE = /^(\d{1,3}(?:\.\d{1,3}){3}):(\d{2,5})$/

async function collectProxies(env) {
  const cached = await env.ATLAS_KV.get(PROXY_CACHE_KEY)
  if (cached) {
    const parsed = JSON.parse(cached)
    if (Date.now() - parsed.at < PROXY_TTL_MS) return { ...parsed, cached: true }
  }
  const results = await Promise.all(PROXY_SOURCES.map(async (src) => {
    try {
      const r = await fetch(src.url, { cf: { cacheTtl: 600, cacheEverything: true } })
      if (!r.ok) return { ...src, ok: false, count: 0, entries: [] }
      const text = await r.text()
      const entries = []
      if (src.kind === 'json') {
        let rows
        try { rows = JSON.parse(text) } catch { return { ...src, ok: false, count: 0, entries: [] } }
        for (const row of rows) {
          const kind = row.protocol === 'socks4' ? 'socks4' : row.protocol === 'socks5' ? 'socks5' : row.protocol === 'http' ? 'http' : null
          if (!kind || !row.host || !row.port) continue
          entries.push({ kind, host: row.host, port: Number(row.port), country: row.geolocation?.country?.iso_code || null, timeout: row.timeout ?? null })
        }
      } else {
        for (const line of text.split(/\r?\n/)) {
          const v = line.trim()
          if (!v || v.startsWith('#')) continue
          const m = v.match(PROXY_LINE)
          if (m) { entries.push({ host: m[1], port: Number(m[2]) }); continue }
          const g = v.match(/^(\d{1,3}(?:\.\d{1,3}){3}):(\d{2,5})\s+([A-Z]{2})$/)
          if (g) entries.push({ host: g[1], port: Number(g[2]), country: g[3] })
        }
      }
      return { ...src, ok: true, count: entries.length, entries }
    } catch {
      return { ...src, ok: false, count: 0, entries: [] }
    }
  }))
  const lists = { http: [], socks4: [], socks5: [] }
  const seen = new Set()
  const byAddr = new Map()
  for (const r of results) for (const e of r.entries) {
    const kind = e.kind || r.kind
    if (!lists[kind]) continue
    const key = `${kind}:${e.host}:${e.port}`
    const country = e.country || byAddr.get(`${e.host}:${e.port}`) || null
    if (country) byAddr.set(`${e.host}:${e.port}`, country)
    if (seen.has(key)) continue
    seen.add(key)
    lists[kind].push({ host: e.host, port: e.port, country })
  }
  for (const k of ['http', 'socks4', 'socks5']) {
    lists[k] = lists[k].map((e) => (e.country ? e : { ...e, country: byAddr.get(`${e.host}:${e.port}`) || null }))
  }
  const payload = {
    at: Date.now(),
    total: lists.http.length + lists.socks4.length + lists.socks5.length,
    sources: results.map(({ name, url, ok, count }) => ({ name, url, ok, count })),
    lists,
  }
  await env.ATLAS_KV.put(PROXY_CACHE_KEY, JSON.stringify(payload))
  return { ...payload, cached: false }
}

const DISPOSABLE_URL = 'https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/main/disposable_email_blocklist.conf'
const DISPOSABLE_KEY = 'check:disposable:v1'
const DISPOSABLE_TTL_MS = 24 * 60 * 60 * 1000

async function loadDisposable(env) {
  const cached = await env.ATLAS_KV.get(DISPOSABLE_KEY)
  if (cached) {
    const parsed = JSON.parse(cached)
    if (Date.now() - parsed.at < DISPOSABLE_TTL_MS) return new Set(parsed.domains)
  }
  try {
    const r = await fetch(DISPOSABLE_URL, { cf: { cacheTtl: 86400, cacheEverything: true } })
    if (r.ok) {
      const domains = (await r.text()).split(/\r?\n/).map((x) => x.trim().toLowerCase()).filter((x) => x && !x.startsWith('#'))
      await env.ATLAS_KV.put(DISPOSABLE_KEY, JSON.stringify({ at: Date.now(), domains }))
      return new Set(domains)
    }
  } catch {}
  return new Set()
}

async function resolveMx(domain) {
  try {
    const r = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=MX`, {
      headers: { accept: 'application/dns-json' },
    })
    if (!r.ok) return []
    const d = await r.json()
    return (d.Answer || []).filter((a) => a.type === 15).map((a) => a.data)
  } catch {
    return []
  }
}

const COUNTRY_NAMES = { CN: 'China', HK: 'Hong Kong', TW: 'Taiwan', JP: 'Japan', KR: 'South Korea', SG: 'Singapore', US: 'United States', GB: 'United Kingdom', DE: 'Germany', FR: 'France', NL: 'Netherlands', CA: 'Canada', AU: 'Australia', RU: 'Russia', IN: 'India' }

    if (host === HOST_PASTE) {
      if (url.pathname === '/api/paste' && request.method === 'POST') {
        let body
        try { body = await request.json() } catch { return json({ error: 'invalid json' }, 400) }
        const content = String(body.content ?? '')
        if (!content) return json({ error: '内容为空' }, 400)
        if (content.length > 60000) return json({ error: '内容过长(上限 60KB)' }, 413)
        const id = b64url(crypto.getRandomValues(new Uint8Array(6)))
        await env.ATLAS_KV.put(`paste:${id}`, content)
        return json({ url: `https://${HOST_PASTE}/${id}`, raw: `https://${HOST_PASTE}/raw/${id}`, id })
      }
      if (url.pathname.startsWith('/raw/')) {
        const raw = await env.ATLAS_KV.get(`paste:${url.pathname.slice(5)}`)
        if (raw === null) return new Response('not found', { status: 404 })
        return new Response(raw, { headers: { 'content-type': 'text/plain;charset=utf-8' } })
      }
      const m = url.pathname.match(/^\/([A-Za-z0-9_-]{6,32})$/)
      if (m) {
        const raw = await env.ATLAS_KV.get(`paste:${m[1]}`)
        if (raw === null) return new Response(PAGE('未找到', '<h1>404</h1><p class="sub">粘贴内容不存在</p><p><a href="/">回首页</a></p>'), { status: 404, headers: { 'content-type': 'text/html;charset=utf-8' } })
        const esc = raw.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])
        return new Response(PAGE('Paste', `<h1>粘贴内容</h1><p class="sub"><a href="/raw/${m[1]}">查看原文 / raw</a> · ${raw.length} 字符</p><pre style="white-space:pre-wrap;word-break:break-word;font:12px/1.6 ui-monospace,monospace;margin:0">${esc}</pre>`), { headers: { 'content-type': 'text/html;charset=utf-8' } })
      }
      return new Response(PAGE('Atlas Paste', `
<h1>Atlas Paste</h1><p class="sub">临时文本分享 · 存在 Cloudflare KV · 无需服务器</p>
<textarea id="c" placeholder="粘贴要分享的文本..."></textarea>
<button onclick="sv()">生成链接</button><div class="out" id="o" hidden></div>
<script>
async function sv(){
  const c=document.getElementById('c').value; if(!c.trim()) return
  const r=await fetch('/api/paste',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({content:c})})
  const j=await r.json(); const o=document.getElementById('o'); o.hidden=false
  o.innerHTML = j.error ? ('错误: '+j.error) : ('链接: <a href="'+j.url+'" target="_blank">'+j.url+'</a><br>Raw: <a href="'+j.raw+'" target="_blank">'+j.raw+'</a>')
}
</script>`), { headers: { 'content-type': 'text/html;charset=utf-8' } })
    }


    if (host === HOST_NODES) {
      if (url.pathname === '/api/sources') {
        const view = await collectNodes(env)
        return json({ total: view.total, cached: view.cached, at: view.at, sources: view.sources })
      }
      if (url.pathname === '/txt') {
        const view = await collectNodes(env)
        return new Response(view.nodes.join('\n') + '\n', { headers: {
          'content-type': 'text/plain;charset=utf-8', 'access-control-allow-origin': '*', 'cache-control': 'public, max-age=300',
        } })
      }
      if (url.pathname === '/sub') {
        const view = await collectNodes(env)
        const body = b64encodeUtf8(view.nodes.join('\n') + '\n')
        return new Response(body, { headers: {
          'content-type': 'text/plain;charset=utf-8', 'access-control-allow-origin': '*', 'cache-control': 'public, max-age=300',
          'profile-update-interval': '6', 'subscription-userinfo': 'upload=0; download=0; total=0; expire=0',
        } })
      }
      const view = await collectNodes(env)
      return new Response(nodesHome(view), { headers: { 'content-type': 'text/html;charset=utf-8' } })
    }

    if (host === HOST_QR) {
      const data = url.searchParams.get('data') || url.searchParams.get('text') || ''
      const ecc = (url.searchParams.get('ecc') || 'M').toUpperCase()
      const size = Math.min(2048, Math.max(64, Number(url.searchParams.get('size')) || 320))
      if (url.pathname === '/api/qr' || url.pathname === '/qr.png' || url.pathname === '/qr.svg') {
        if (!data) return json({ error: '缺少 data 参数' }, 400)
        if (data.length > 2000) return json({ error: '内容过长(上限 2000 字符)' }, 413)
        const code = qrcode(0, ['L', 'M', 'Q', 'H'].includes(ecc) ? ecc : 'M')
        code.addData(data)
        code.make()
        const svg = code.createSvgTag({ cellSize: 4, margin: 8, scalable: true })
          .replace('width="100px" height="100px"', `width="${size}" height="${size}"`)
        return new Response(svg, { headers: {
          'content-type': 'image/svg+xml;charset=utf-8',
          'access-control-allow-origin': '*',
          'cache-control': 'public, max-age=86400',
        } })
      }
      return new Response(PAGE('Atlas QR', `
<h1>Atlas QR</h1>
<p class="sub">二维码生成 API · 跑在 Cloudflare 边缘 · 替代 qrserver 等第三方</p>
<label>内容</label>
<input id="d" placeholder="https://example.com">
<label>边长大像素(可选)</label>
<input id="s" placeholder="320">
<button onclick="go()">生成</button>
<div class="out" id="o" hidden></div>
<script>
function go(){
  const d=document.getElementById('d').value.trim(); if(!d) return
  const s=document.getElementById('s').value.trim()
  const u='/api/qr?data='+encodeURIComponent(d)+(s?('&size='+encodeURIComponent(s)):'')
  const o=document.getElementById('o'); o.hidden=false
  o.innerHTML='<img alt="qr" style="width:220px;height:220px;background:#fff;border-radius:6px;padding:8px" src="'+u+'"><br><code>https://${HOST_QR}'+u+'</code>'
}
</script>`), { headers: { 'content-type': 'text/html;charset=utf-8' } })
    }

    if (host === HOST_PROXY) {
      if (url.pathname === '/api/sources') {
        const view = await collectProxies(env)
        return json({ total: view.total, cached: view.cached, at: view.at, sources: view.sources })
      }
      const kind = url.pathname === '/http' ? 'http' : url.pathname === '/socks4' ? 'socks4' : url.pathname === '/socks5' ? 'socks5' : null
      if (kind || url.pathname === '/json' || url.pathname === '/all') {
        const view = await collectProxies(env)
        const slow = url.searchParams.get('country')
        if (url.pathname === '/json') {
          const out = {}
          for (const k of ['http', 'socks4', 'socks5']) out[k] = slow ? view.lists[k].filter((x) => x.country === slow.toUpperCase()) : view.lists[k]
          return json({ at: view.at, cached: view.cached, counts: { http: view.lists.http.length, socks4: view.lists.socks4.length, socks5: view.lists.socks5.length }, proxies: out }, 200, { 'access-control-allow-origin': '*' })
        }
        const pick = url.pathname === '/all' ? ['http', 'socks4', 'socks5'] : [kind]
        const lines = pick.flatMap((k) => view.lists[k].map((x) => `${x.host}:${x.port}`))
        return new Response(lines.join('\n') + '\n', { headers: {
          'content-type': 'text/plain;charset=utf-8', 'access-control-allow-origin': '*', 'cache-control': 'public, max-age=600',
        } })
      }
      const view = await collectProxies(env)
      const rows = view.sources.map((s) => `<tr><td>${s.name}</td><td style="color:${s.ok ? '#35d07f' : '#e06c75'}">${s.ok ? s.count : 'FAIL'}</td><td><a href="${s.url}" target="_blank">源</a></td></tr>`).join('')
      const age = Math.max(0, Math.round((Date.now() - view.at) / 1000))
      return new Response(PAGE('Atlas Proxy', `
<h1>Atlas Proxy</h1>
<p class="sub">公开代理聚合 API · 跑在 Cloudflare 边缘 · 10 分钟缓存</p>
<p class="sub" style="color:#e0a862">仅供研究与连通性测试:这些代理来自公开抓取,不保证可用性与安全性,请勿用于敏感流量。</p>
<label>HTTP 代理列表</label>
<input value="https://${HOST_PROXY}/http" readonly onclick="this.select()">
<label>SOCKS4</label>
<input value="https://${HOST_PROXY}/socks4" readonly onclick="this.select()">
<label>SOCKS5</label>
<input value="https://${HOST_PROXY}/socks5" readonly onclick="this.select()">
<label>JSON(含国家)</label>
<input value="https://${HOST_PROXY}/json" readonly onclick="this.select()">
<div class="out">http <code>${view.lists.http.length}</code> · socks4 <code>${view.lists.socks4.length}</code> · socks5 <code>${view.lists.socks5.length}</code> · 缓存于 ${age}s 前${view.cached ? '(命中缓存)' : '(本次刷新)'}</div>
<label>上游来源</label>
<table style="width:100%;border-collapse:collapse;font-size:12px"><tbody>${rows}</tbody></table>
<style>td{padding:5px 8px;border-bottom:1px solid #1e2427;color:#b8c2c7}</style>`), { headers: { 'content-type': 'text/html;charset=utf-8' } })
    }

    if (host === HOST_IP) {
      const q = url.searchParams.get('ip') || url.searchParams.get('q')
      const cf = request.cf || {}
      const ip = q || request.headers.get('cf-connecting-ip') || (request.headers.get('x-forwarded-for') || '').split(',')[0].trim()
      if (url.pathname === '/json' || url.pathname === '/api/ip') {
        if (q && q !== ip) {
          return json({ error: '本服务只返回发起请求的客户端 IP;查询任意 IP 需要外部数据源' }, 501)
        }
        return json({
          ip: ip || null,
          country: cf.country || null,
          country_name: COUNTRY_NAMES[cf.country] || null,
          continent: cf.continent || null,
          city: cf.city || null,
          region: cf.region || null,
          region_code: cf.regionCode || null,
          postal: cf.postalCode || null,
          latitude: cf.latitude || null,
          longitude: cf.longitude || null,
          timezone: cf.timezone || null,
          asn: cf.asn || null,
          as_organization: cf.asOrganization || null,
          colo: cf.colo || null,
          tls_version: cf.tlsVersion || null,
          http_protocol: cf.httpProtocol || null,
          user_agent: request.headers.get('user-agent') || null,
          at: Date.now(),
        }, 200, { 'access-control-allow-origin': '*' })
      }
      if (url.pathname === '/') {
        return new Response(PAGE('Atlas IP', `
<h1>Atlas IP</h1>
<p class="sub">客户端 IP / 地理位置 / ASN 查询 · 跑在 Cloudflare 边缘 · 替代 ipinfo 等第三方</p>
<div class="out" id="o">查询中...</div>
<label>JSON API</label>
<input value="https://${HOST_IP}/json" readonly onclick="this.select()">
<label>curl</label>
<input value="curl -s https://${HOST_IP}/json" readonly onclick="this.select()">
<script>
fetch('/json').then(r=>r.json()).then(j=>{
  document.getElementById('o').innerHTML =
    '<b>'+j.ip+'</b><br>'+(j.country_name||'')+' '+(j.country||'')+' · '+(j.city||'-')+' · '+(j.region||'-')+
    '<br>ASN '+j.asn+' '+(j.as_organization||'')+'<br>colo '+(j.colo||'-')+' · '+(j.timezone||'-')
}).catch(e=>{document.getElementById('o').textContent='查询失败: '+e})
</script>`), { headers: { 'content-type': 'text/html;charset=utf-8' } })
      }
      return new Response('not found', { status: 404 })
    }

    if (host === HOST_CHECK) {
      const mail = (url.searchParams.get('email') || '').trim().toLowerCase()
      const dom = (url.searchParams.get('domain') || mail.split('@')[1] || '').trim().toLowerCase()
      if (url.pathname === '/api/email' || url.pathname === '/api/domain') {
        if (!dom) return json({ error: '缺少 email 或 domain 参数' }, 400)
        const list = await loadDisposable(env)
        const disposable = list.has(dom)
        const mx = await resolveMx(dom)
        const payload = url.pathname === '/api/domain'
          ? { domain: dom, disposable, has_mx: mx.length > 0, mx, format_valid: /^[a-z0-9.-]+\.[a-z]{2,}$/.test(dom), blocklist_size: list.size }
          : { email: mail || null, domain: dom, format_valid: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail), disposable, has_mx: mx.length > 0, mx, blocklist_size: list.size }
        return json(payload, 200, { 'access-control-allow-origin': '*' })
      }
      return new Response(PAGE('Atlas Check', `
<h1>Atlas Check</h1>
<p class="sub">邮箱 / 域名校验 · 一次性邮箱检测 + MX 查询 · 跑在 Cloudflare 边缘 · 替代 disify 等第三方</p>
<label>邮箱或域名</label>
<input id="e" placeholder="someone@example.com">
<button onclick="go()">检查</button>
<div class="out" id="o" hidden></div>
<label>API</label>
<input value="https://${HOST_CHECK}/api/email?email=someone@example.com" readonly onclick="this.select()">
<script>
async function go(){
  const v=document.getElementById('e').value.trim(); if(!v) return
  const p = v.includes('@') ? '/api/email?email='+encodeURIComponent(v) : '/api/domain?domain='+encodeURIComponent(v)
  const j = await (await fetch(p)).json()
  const o=document.getElementById('o'); o.hidden=false
  if (j.error) { o.textContent='错误: '+j.error; return }
  o.innerHTML = '一次性邮箱: <b style="color:'+(j.disposable?'#e06c75':'#35d07f')+'">'+(j.disposable?'是':'否')+'</b>'+
    '<br>格式有效: '+(j.format_valid?'是':'否')+'<br>MX 记录: '+(j.has_mx ? j.mx.join(', ') : '无')+
    '<br>黑名单规模: '+j.blocklist_size
}
</script>`), { headers: { 'content-type': 'text/html;charset=utf-8' } })
    }

    return new Response('atlas-edge-kit', { status: 404 })
  },
}

function json(obj, status = 200, extra = {}) {
  return new Response(JSON.stringify(obj, null, 2), { status, headers: { 'content-type': 'application/json;charset=utf-8', ...extra } })
}
