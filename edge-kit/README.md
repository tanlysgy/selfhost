# atlas-edge-kit (Cloudflare Worker)

一个 Worker 承载 7 个自托管边缘服务(零本机资源占用):

| 域名 | 功能 |
| --- | --- |
| `short.sgyyyds.qzz.io` | Atlas Short — 短链服务(302 跳转 + 点击统计) |
| `paste.sgyyyds.qzz.io` | Atlas Paste — 文本/代码粘贴(/raw 回显) |
| `nodes.sgyyyds.qzz.io` | Atlas Nodes — 免费节点聚合订阅(11 源 / 13,000+ 节点) |
| `qr.sgyyyds.qzz.io` | Atlas QR — 二维码生成 API(`/api/qr?data=`,SVG) |
| `px.sgyyyds.qzz.io` | Atlas Proxy — 公开代理聚合(`/http` `/socks4` `/socks5` `/json`) |
| `ip.sgyyyds.qzz.io` | Atlas IP — 客户端 IP / 地理位置 / ASN 查询(`/json`) |
| `check.sgyyyds.qzz.io` | Atlas Check — 邮箱/域名校验(`/api/email` `/api/domain`) |

## 数据

全部状态存于 Workers KV `ATLAS_KV`(namespace id `b9a5a660ec1d4a5e9a60335a00255315`)。

Atlas Nodes 每 30 分钟抓取 11 个上游公开源并去重,缓存于 KV key `nodes:cache:v1`。
Atlas Proxy 每 10 分钟抓取上游代理列表,缓存于 `proxy:cache:v1`。
Atlas Check 每 24 小时刷新一次性邮箱黑名单,缓存于 `check:disposable:v1`。
**修改任一源列表后必须手动删除对应 KV key**,否则 TTL 内仍返回旧数据。

## 端点

- Nodes: `/` `/sub` `/txt` `/api/sources`
- QR: `/api/qr?data=- `/` 来源面板 · `/sub` Base64 订阅 · `/txt` 明文 · `/api/sources` 各源计数size=- `/` 来源面板 · `/sub` Base64 订阅 · `/txt` 明文 · `/api/sources` 各源计数ecc=`
- Proxy: `/` `/http` `/socks4` `/socks5` `/json` `/api/sources`
- IP: `/` `/json`
- Check: `/` `/api/email?email=` `/api/domain?domain=`
- Short: `/` `POST /api/shorten` `/api/list` `/stats/:id` `/:id`
- Paste: `/` `POST /api/paste` `/raw/:id` `/:id`

## 部署

```bash
CLOUDFLARE_ACCOUNT_ID=<account> CLOUDFLARE_API_TOKEN=<token> wrangler deploy
```

需要 token 权限:`Workers Scripts:Edit` + `Workers KV Storage:Edit`。
