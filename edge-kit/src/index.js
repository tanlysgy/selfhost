const HOST_SHORT = 'short.sgyyyds.qzz.io'
const HOST_PASTE = 'paste.sgyyyds.qzz.io'
const HOST_NODES = 'nodes.sgyyyds.qzz.io'

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

    return new Response('atlas-edge-kit', { status: 404 })
  },
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj, null, 2), { status, headers: { 'content-type': 'application/json;charset=utf-8' } })
}
