# 视觉与素材

## 色板（深色高级默认值）

```css
--bg:#1b1611; --bg2:#251e17; --card:#2a221a;
--ink:#f7f1e8; --ink2:#ddd3c5; --mut:#aa9e8f;
--gold:#e2a65a; --line:rgba(244,237,227,.15);
```

演进记录：近黑（#0d0a07）被说「太暗」→ 调到暖深棕后通过。白底被说「太白、不高级」。

## AI 场景图

用 Codex 图片生成（无法用时先确认可用的模型，别直接说做不到）：

```bash
codex exec --skip-git-repo-check -m <可用模型> -s workspace-write \
  "Use your built-in image generation tool to create ONE image, then copy the resulting PNG to <out>.png. Do not write code. Image: <画面>. Style: $STY." < /dev/null
```

- 后台跑一定要 `< /dev/null`，否则卡在 “Reading additional input from stdin”。
- 统一风格：`photorealistic cinematic editorial photograph, landscape 16:9, premium brand campaign, warm low light, deep shadows, shallow depth of field, 35mm, no text, no logos, no readable screens, no faces visible`
- 画面里留出放文字的一侧（「empty dark negative space on the left third」）。
- 转 webp：`ffmpeg -i x.png -vf "scale='min(2400,iw)':-2" -c:v libwebp -quality 80 x.webp`

## 产品动图（核心）

**用动画 WebP，不用 GIF、不用视频**：GIF 只有 256 色、字发糊、体积大；视频会被浏览器自动播放策略拦（低电量模式、App 内置浏览器）。

录制：Chrome 屏幕广播（CDP `Page.startScreencast`）逐帧带时间戳，比反复截图流畅得多：

```js
const s=await page.context().newCDPSession(page);const fr=[];
s.on('Page.screencastFrame',f=>{fr.push({t:f.metadata.timestamp,d:f.data});s.send('Page.screencastFrameAck',{sessionId:f.sessionId});});
await s.send('Page.startScreencast',{format:'jpeg',quality:92,maxWidth:vw*2,maxHeight:vh*2,everyNthFrame:1});
await doTheFlow();   // 真实点击：鼠标移动带 steps，加一个可见的圆形光标
await s.send('Page.stopScreencast');
// 写帧 + 每帧时长 → ffmpeg concat 列表
```

合成：

```bash
ffmpeg -f concat -safe 0 -i list.txt -vf "fps=15~20,scale=1280:-2:flags=lanczos" \
  -c:v libwebp_anim -quality 78 -compression_level 6 -loop 0 -an out.webp
```

- **一定用 `libwebp_anim`**（只存帧间变化）：同一段 `libwebp` 3.8 MB → `libwebp_anim` 88 KB。
- 结尾停 1.2 秒再循环。
- 平板整屏 1280 宽约 0.4–1 MB，手机 390 宽约 0.1 MB。
- 产品有随机模拟故障（如打印失败）时，按成功特征检测，不成功自动重录。
- 示例数据要像真的：商品有图、有几笔历史订单、数字合理。

## 设备外框

```css
.device{padding:14px;border-radius:30px;background:linear-gradient(145deg,#3a3128,#16120e)}
/* 手机：与产品自身的手机预览一致，按机身宽度等比 */
.phone{container-type:inline-size}
.phone .pb{padding:3.4cqw;border-radius:15cqw;background:#18181b;box-shadow:0 0 0 1px #3f3f46 inset,0 40px 70px -24px rgba(0,0,0,.75)}
.phone .notch{position:absolute;top:5.6cqw;left:50%;width:30cqw;height:8cqw;transform:translateX(-50%);border-radius:5cqw;background:#18181b}
.phone .scr{padding-top:10.5cqw;border-radius:11.6cqw;overflow:hidden;background:#fff}
```

## 视频自动播放

静音 + loop + playsinline；IntersectionObserver：提前一屏下载、进入 25% 可见就播、离开暂停；用户手动暂停后不再自动续播；被浏览器拦截（`NotAllowedError`）时保留播放按钮，并在用户第一次点击 / 触屏时补播。不要因为「减少动态效果」系统设置就不播——那会让很多 Mac / iPhone 用户看到的永远是静止的。

预览服务器不支持 HTTP Range 时，先 fetch 成 Blob 再播，章节跳转才可靠。

## 必备 CSS 细节

```css
img{display:block;max-width:100%;height:auto}   /* 少了 height:auto 图片会被压扁 */
html[lang=tr] body,html[lang=en] body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Helvetica Neue","Noto Sans",Roboto,Arial,sans-serif}
main>section{overflow-x:clip}                    /* 装饰光晕撑出 320px 宽 */
html{scrollbar-color:rgba(244,237,227,.22) var(--bg);scrollbar-width:thin;color-scheme:dark}
```

JS 里别用 `const top = …` —— 与 `window.top` 冲突，整个脚本不执行。
