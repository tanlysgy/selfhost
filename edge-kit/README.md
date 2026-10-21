# atlas-edge-kit (Cloudflare Worker)

一个 Worker 承载 3 个自托管边缘服务(零本机资源占用):

| 域名 | 功能 |
| --- | --- |
| `short.sgyyyds.qzz.io` | Atlas Short — 短链服务(302 跳转 + 点击统计) |
| `paste.sgyyyds.qzz.io` | Atlas Paste — 文本/代码粘贴(/raw 回显) |
| `nodes.sgyyyds.qzz.io` | Atlas Nodes — 免费节点聚合订阅 |

## 数据

全部状态存于 Workers KV `ATLAS_KV`(namespace id `b9a5a660ec1d4a5e9a60335a00255315`)。

Atlas Nodes 每 30 分钟抓取 8 个上游公开源并去重,缓存于 KV key `nodes:cache:v1`。
**修改源列表后必须手动删除该 key**,否则 30 分钟内仍返回旧数据。

## 端点

- `/` 来源面板 · `/sub` Base64 订阅 · `/txt` 明文 · `/api/sources` 各源计数

## 部署

```bash
CLOUDFLARE_ACCOUNT_ID=<account> CLOUDFLARE_API_TOKEN=<token> wrangler deploy
```

需要 token 权限:`Workers Scripts:Edit` + `Workers KV Storage:Edit`。
