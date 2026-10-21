# atlas-edge-kit (Cloudflare Worker)

一个 Worker 承载 10 个自托管边缘服务(零本机资源占用):

| 域名 | 功能 |
| --- | --- |
| `short.sgyyyds.qzz.io` | Atlas Short — 短链服务(302 跳转 + 点击统计) |
| `paste.sgyyyds.qzz.io` | Atlas Paste — 文本/代码粘贴(`/raw/:id` 回显) |
| `nodes.sgyyyds.qzz.io` | Atlas Nodes — 免费节点聚合订阅(11 源 / 13,000+ 节点) |
| `qr.sgyyyds.qzz.io` | Atlas QR — 二维码生成 API(`/api/qr?data=`,SVG) |
| `px.sgyyyds.qzz.io` | Atlas Proxy — 公开代理聚合(`/http` `/socks4` `/socks5` `/json`) |
| `ip.sgyyyds.qzz.io` | Atlas IP — 客户端 IP / 地理位置 / ASN 查询(`/json`) |
| `check.sgyyyds.qzz.io` | Atlas Check — 邮箱/域名校验(`/api/email` `/api/domain`) |
| `geo.sgyyyds.qzz.io` | Atlas Geo — 地理编码 / 逆地理编码(`/json?q=` `/reverse?lat=&lon=`) |
| `meta.sgyyyds.qzz.io` | Atlas Meta — 链接元数据 / OpenGraph 解析(`/json?url=`) |
| `tools.sgyyyds.qzz.io` | Atlas Tools — 哈希 / UUID / 编解码(`/api/hash` `/api/uuid` `/api/encode`) |

## 数据

全部状态存于 Workers KV `ATLAS_KV`(namespace id `b9a5a660ec1d4a5e9a60335a00255315`)。

| 缓存 key | 内容 | TTL |
| --- | --- | --- |
| `nodes:cache:v1` | Atlas Nodes 11 个上游源合并去重后的节点 | 30 分钟 |
| `proxy:cache:v1` | Atlas Proxy 上游代理列表(含国家/ASN) | 10 分钟 |
| `check:disposable:v1` | 一次性邮箱域名黑名单 | 24 小时 |
| `geo:v1:*` | Nominatim 地理编码结果 | 7 天 |
| `meta:v1:*` | OpenGraph / 链接元数据抓取结果 | 24 小时 |

**修改任一源列表后必须手动删除对应 KV key**,否则 TTL 内仍返回旧数据:

```bash
curl -X DELETE -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/storage/kv/namespaces/b9a5a660ec1d4a5e9a60335a00255315/values/nodes%3Acache%3Av1"
```

## 端点

- Nodes: `/` `/sub` `/txt` `/api/sources`
- QR: `/api/qr?data=&size=&ecc=`
- Proxy: `/` `/http` `/socks4` `/socks5` `/json` `/api/sources`
- IP: `/` `/json`
- Check: `/` `/api/email?email=` `/api/domain?domain=`
- Geo: `/` `/json?q=&limit=&lang=` `/reverse?lat=&lon=`
- Meta: `/` `/json?url=`
- Tools: `/` `/api/hash?alg=&data=` `/api/uuid?count=` `/api/encode?mode=&data=`
- Short: `/` `POST /api/shorten` `/api/list` `/stats/:id` `/:id`
- Paste: `/` `POST /api/paste` `/raw/:id` `/:id`

## 部署

```bash
CLOUDFLARE_ACCOUNT_ID=<account> CLOUDFLARE_API_TOKEN=<token> wrangler deploy
```

需要 token 权限:`Workers Scripts:Edit` + `Workers KV Storage:Edit`。

新增子域走 `routes[].custom_domain`,wrangler 会自动创建 DNS 记录与证书;
首次部署后证书签发需要 1–5 分钟,期间 `curl` 会返回 `000`。
