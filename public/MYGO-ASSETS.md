# MyGO!!!!! 主题资源

主题已集成 Logo 和角色横幅，需要把以下图片放入 `public/` 目录：

| 文件名 | 用途 | 显示位置 |
|---|---|---|
| `mygo-logo.png` | 乐队 Logo（手写蓝绿色） | 右下角水印，半透明 |
| `mygo-characters.png` | 5 位角色立绘（横幅 2:1） | Dashboard 顶部 Hero 横幅 |

## 集成方式

- `ThemeBackground` 组件在右下角渲染 `<img src="/mygo-logo.png" />`
- `MyGoHero` 组件在 StatsCards 上方渲染角色横幅
- 加载失败时（文件不存在）会优雅隐藏，不会出现破图

## 版权说明

这些素材来自动画「It's MyGO!!!!!」（原作出处：芳文社 / Bushiroad）。
请仅限**个人学习与本地使用**，不要发布到公开网络或用于商业用途。
若用于公开分享，请联系原版权方获得授权。