# promo-page

> 一个 [Claude Code Skill](https://docs.claude.com/en/docs/claude-code/skills)：让 AI 一次做对产品推广页 / 官网 / 落地页。
>
> A Claude Code skill for building product landing pages that sell — positioning first, real product footage, one-screen hero, multilingual, and a QA pass before every hand-off.

这份打法来自一个三语 SaaS 官网的几十轮真实反馈。每条规则都对应一次返工：「像小作坊」「只看到一个角落看不懂」「图片被压扁了」「大屏两边空一大块」……照着默认值做，能省掉大部分来回。

## 它会怎么做

1. **开工表**：先把品类一句话、独有卖点、主按钮去哪、价格、公司信息、法规红线一次问清（能查的自己查）。
2. **定位**：官网是诱客的，不是说明书；只主打「别人没有、我们有」；不写「即将推出」、不写效果承诺。
3. **固定版式**：品类首屏一屏看完 → 信任条 → 产品家族轮播 → 行业方案 → 独有能力 → 演示视频 → 功能 / 价格 / FAQ → 品牌收口 → 公司式页脚。
4. **真实产品素材**：真实界面的循环动图（动画 WebP，比 GIF 清晰、比视频不受自动播放限制），设备里放完整一屏。
5. **多语言**：每种语言单独录素材。
6. **交付前检查**：多语言 × 多宽度自动检查（溢出、报错、图片变形、禁用词、视频自动播放）+ 人眼看截图。

## 安装

```bash
git clone https://github.com/weifashi/promo-page ~/.claude/skills/promo-page
```

然后对 Claude 说「给 X 做个官网 / 推广页」即可触发。

## 目录

| 文件 | 内容 |
|---|---|
| `SKILL.md` | 主流程与规则 |
| `references/kickoff.md` | 开工表 |
| `references/structure.md` | 版式与文案公式、首屏 / 轮播实现要点 |
| `references/visual.md` | 色板、AI 场景图、产品动图录制与合成、设备外框、视频自动播放 |
| `references/qa.md` | 检查配置、人眼检查、低级错误清单 |
| `references/tooling.md` | 推荐的工程组织 |
| `references/case-study.md` | 案例：反馈如何一步步变成规则 |
| `assets/qa.cjs` | 通用自动检查脚本（Playwright） |

## License

MIT
