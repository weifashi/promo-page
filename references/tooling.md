# 工程组织（推荐）

静态站点，由脚本生成，不引框架：

```
site-src/
  sitecopy.py     # 文案字典：COPY[lang] = {...}，改文案只改这里
  page.py         # 读文案 → 生成 index.html / en/ / zh/
  style.css       # 全站样式（深色 tokens、版式、断点）
  app.js          # 视频自动播放、轮播、顶栏磨砂、渐显
  gen-scenes.sh   # AI 场景图
  capture.cjs     # 按语言截图 + 录产品主流程（带失败重录）
  tiles.cjs       # 录模块动图（CDP 屏幕广播）
  tiles-webp.py   # 帧 → 动画 WebP（libwebp_anim）
  film.py         # 剪演示视频（可选）
  qa.cjs          # 自动检查
  build.sh        # 一键：素材转换 → 视频 → 页面
assets/           # 生成物：photos/ shots/<lang>/ film-<lang>.mp4 …
```

约定：

- 页面里引用 `style.css?v=N`、`app.js?v=N`，改了就把 N 加一。
- 每种语言单独录一套截图 / 动图 / 视频（`shots/<lang>/`）。
- 录制和合成用独立的临时目录；**同一时间只跑一个录制任务**，多个会话共用同一个临时目录会互相覆盖帧，合成出错帧。
- 部署：把 `index.html`、各语言目录、`assets/` 拷到站点目录；先备份线上目录。
- 本地起静态服务（`python3 -m http.server`）做检查，公网访问不稳定时不要拿公网结果当结论。
