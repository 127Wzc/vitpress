---
title: 'Prompt 个人收藏'
description: '常用、高效的提示词收藏夹：按场景分类，卡片化呈现，随取随用'
cover: false
tag: ['Prompt模板']
readingTime: true
recommend: 5
---

# Prompt 个人收藏

## 行程规划

### 旅行规划表设计
::::::tip 旅行规划表设计（A4 打印友好模板）
- 场景：创建可打印的 A4 旅行规划表（多页支持）
- 目标：清晰信息分区、打印友好、响应式与轻动画
- 适用范围：个人/团队旅行行程可视化与打印
- 输入要求：目的地、日期、行程/交通/住宿/预算等数据
- 输出格式：HTML、CSS、JavaScript 代码（含打印优化）
- 备注：参考mcp等实现参考连接 https://linux.do/t/topic/656539
::::::

```
# 旅行规划表设计提示词

你是一位优秀的平面设计师和前端开发工程师，具有丰富的旅行信息可视化经验，曾为众多知名旅游平台设计过清晰实用的旅行规划表。现在需要为我创建一个A4纸张大小的旅行规划表，适合打印出来随身携带使用。请使用HTML、CSS和JavaScript代码实现以下要求：

## 基本要求

**尺寸与基础结构**
- 严格符合A4纸尺寸（210mm×297mm），比例为1:1.414
- 适合打印的设计，预留适当的打印边距（建议上下左右各10mm）
- 允许多页打印，内容现在可以自然流动到多页
- 信息分区清晰，使用网格布局确保整洁有序
- 打印友好的配色方案，避免过深的背景色和过小的字体

**技术实现**
- 使用打印友好的CSS设计
- 提供专用的打印按钮，优化打印样式，优化打印分页，防止它们在打印时被切割
- 使用高对比度的配色方案，确保打印后清晰可读
- 可选择性地添加虚线辅助剪裁线
- 使用Google Fonts或其他CDN加载适合的现代字体
- 引用Font Awesome提供图标支持

**专业设计技巧**

**图形元素与图表：**
1.  **图标 (Font Awesome)：**
    * **来源：** 通过 CDN 引入 Font Awesome (v5/v6)。
    * **风格：** 偏好简洁、现代的**线框风格 (outline-style)** 图标。
    * **使用：** 放置于主标题附近，可选择性地（且需微妙地）用于迷你卡片内部（靠近标题处）、列表前缀等。**严格禁止使用 Emoji 作为功能性图标**。颜色应协调；关键图标可使用高亮色。
2.  **数据可视化 (推荐 Chart.js)：**
    * **应用场景：** 用于展示趋势、增长率、构成（饼图/环形图）、比较（柱状图）等适合的数据 [引用：数据可视化最佳实践]。
    * **技术：** 通过 CDN 嵌入 Chart.js。
    * **位置：** 放置在讨论财务或业务分析的相关主卡片内部。
    * **样式：** 确保图表清晰、易读且响应式。

**技术与动画：**
1.  **技术栈：**
    * HTML5, TailwindCSS 3+ (CDN), 原生 JavaScript (用于 Intersection Observer/图表初始化), Font Awesome (CDN), Chart.js (CDN)。
2.  **动画 (CSS Transitions & Intersection Observer)：**
    * **触发：** 当元素（所有主卡片、所有迷你卡片、其他内容块）滚动进入视口时。
    * **效果：** 平滑、微妙的**淡入/向上滑动**效果（模仿 Apple 风格）。通过 JavaScript 的 `Intersection Observer API` 添加/移除 CSS 类来触发 `CSS Transitions` 实现。确保动画性能流畅。为网格项应用轻微延迟以产生交错效果。
3.  **响应式设计：**
    * **强制要求**。使用 Tailwind 的响应式修饰符（特别是针对网格布局），确保在手机、平板和桌面设备上均具有出色的显示效果和可用性。
    - 使用图标和颜色编码区分不同类型的活动（景点、餐饮、交通等）
    - 为景点和活动设计简洁的时间轴或表格布局
    - 使用简明的图示代替冗长文字描述
    - 为重要信息添加视觉强调（如框线、加粗、不同颜色等）
    - 在设计中融入城市地标元素作为装饰，增强辨识度

## 设计风格

- **实用为主的旅行工具风格**：以清晰的信息呈现为首要目标
- **专业旅行指南风格**：参考Lonely Planet等专业旅游指南的排版和布局
- **信息图表风格**：将复杂行程转化为直观的图表和时间轴
- **简约现代设计**：干净的线条、充分的留白和清晰的层次结构
- **整洁的表格布局**：使用表格组织景点、活动和时间信息
- **地图元素整合**：在合适位置添加简化的路线或位置示意图
- **打印友好的灰度设计**：即使黑白打印也能保持良好的可读性和美观

## 内容区块

1.  **行程标题区**：
    - 目的地名称（主标题，醒目位置）
    - 旅行日期和总天数
    - 旅行者姓名/团队名称（可选）
    - 天气信息摘要
2.  **行程概览区**：
    - 按日期分区的行程简表
    - 每天主要活动/景点的概览
    - 使用图标标识不同类型的活动
3.  **详细时间表区**：
    - 以表格或时间轴形式呈现详细行程
    - 包含时间、地点、活动描述
    - 每个景点的停留时间
    - 标注门票价格和必要预订信息
4.  **交通信息区**：
    - 主要交通换乘点及方式
    - 地铁/公交线路和站点信息
    - 预计交通时间
    - 使用箭头或连线表示行程路线
5.  **住宿与餐饮区**：
    - 酒店/住宿地址和联系方式
    - 入住和退房时间
    - 推荐餐厅列表（标注特色菜和价格区间）
    - 附近便利设施（如超市、药店等）
7.  **实用信息区**：
    - 紧急联系电话
    - 重要提示和注意事项
    - 预算摘要
    - 行李清单提醒

## 示例内容（基于上海一日游）

**目的地**：上海一日游
**日期**：2025年3月30日（星期日）
**天气**：阴，13°C/7°C，东风1-3级

**时间表**：
| 时间        | 活动           | 地点         | 详情        |
|-------------|----------------|--------------|-------------|
| 09:00-11:00 | 游览豫园       | 福佑路168号  | 门票：40元  |
| 11:00-12:30 | 城隍庙午餐     | 城隍庙商圈   | 推荐：南翔小笼包 |
| 13:30-15:00 | 参观东方明珠   | 世纪大道1号  | 门票：80元起 |
| 15:30-17:30 | 漫步陆家嘴     | 陆家嘴金融区 | 免费活动    |
| 18:30-21:00 | 迪士尼小镇或黄浦江夜游 | 详见备注     | 夜游票：120元 |

**交通路线**：
- 豫园→东方明珠：乘坐地铁14号线（豫园站→陆家嘴站），步行10分钟，约25分钟
- 东方明珠→迪士尼：地铁2号线→16号线→11号线，约50分钟

**实用提示**：
- 下载"上海地铁"APP查询路线
- 携带雨伞，天气多变
- 避开东方明珠12:00-14:00高峰期
- 提前充值交通卡或准备移动支付
- 城隍庙游客较多，注意保管随身物品

**重要电话**：
- 旅游咨询：021-12301
- 紧急求助：110（警察）/120（急救）

请创建一个既美观又实用的旅行规划表，适合打印在A4纸上随身携带，帮助用户清晰掌握行程安排。
```

## 绘图

### 手办化
:::::tip 手办化（1/7 PVC 商业化场景）
- 场景：将照片主体转为逼真的 1/7 比例 PVC 手办并布景
- 目标：保持主体神似度，具备 3D 体积感与 PVC 质感
- 适用范围：人物/动物/造型主体的产品图风格
- 输入要求：主体照片（尽量清晰）；可补充风格/品牌信息
- 输出格式：产品场景图（手办+包装盒+显示器+底座+室内场景）
- 备注：适合商品页/展示海报；可搭配品牌元素
:::::

```
Please accurately transform the main subject in this photo into a realistic, masterpiece-like 1/7 scale PVC statue.
Behind this statue, a packaging box should be placed: the box has a large clear front window on its front side, and is printed with subject artwork, product name, brand logo, barcode, as well as a small specifications or authenticity verification panel. A small price tag sticker must also be attached to one corner of the box. Meanwhile, a computer monitor is placed at the back, and the monitor screen needs to display the ZBrush modeling process of this statue.
In front of the packaging box, this statue should be placed on a round plastic base. The statue must have 3D dimensionality and a sense of realism, and the texture of the PVC material needs to be clearly represented. If the background can be set as an indoor scene, the effect will be even better.

Below are detailed guidelines to note:
When repairing any missing parts, there must be no poorly executed elements.
When repairing human figures (if applicable), the body parts must be natural, movements must be coordinated, and the proportions of all parts must be reasonable.
If the original photo is not a full-body shot, try to supplement the statue to make it a full-body version.
The human figure's expression and movements must be exactly consistent with those in the photo.
The figure's head should not appear too large, its legs should not appear too short, and the figure should not look stunted—this guideline may be ignored if the statue is a chibi-style design.
For animal statues, the realism and level of detail of the fur should be reduced to make it more like a statue rather than the real original creature.
No outer outline lines should be present, and the statue must not be flat.
Please pay attention to the perspective relationship of near objects appearing larger and far objects smaller.
```

### 手办化2
:::::tip 手办化2（nano-banana 模型，BANDAI 风包装）
- 场景：插画角色转 1/7 商业化手办，桌面展示
- 目标：真实场景与材质，带建模过程屏幕与品牌包装
- 适用范围：插画/概念角色商品化展示
- 输入要求：插画或角色立绘
- 输出格式：桌面场景图（透明亚克力圆底座、显示器ZBrush进程、BANDAI风包装）
- 备注：可改 BANDAI 为自有品牌风格
:::::

```
Use the nano-banana model to create a 1/7 scale commercialized figure of thecharacter in the illustration, in a realistic styie and environment.Place the figure on a computer desk, using a circular transparent acrylic basewithout any text.On the computer screen, display the ZBrush modeling process of the figure.Next to the computer screen, place a BANDAl-style toy packaging box printedwith the original artwork.
```

### 手办化3
:::::tip 手办化3（强调相似度与属性锁定）
- 场景：从用户照片准确转 1/7 手办与包装
- 目标：人像特征高度还原，3D 面雕不走样
- 适用范围：真人/角色照片商品化
- 输入要求：清晰人物照片；可补充发型/服装关键特征
- 输出格式：室内场景中手办+包装+圆形底座
- 备注：适合品牌联名与IP还原
:::::

```
Your primary mission is to accurately convert the subject from the user's photo into a photorealistic, masterpiece quality, 1/7 scale PVC figurine, presented in its commercial packaging.

Crucial First Step: Analyze the image to identify the subject's key attributes (e.g., human male, human female, animal, specific creature) and defining features (hair style, clothing, expression). The generated figurine must strictly adhere to these identified attributes.

Top Priority - Character Likeness: The figurine's face MUST maintain a strong likeness to the original character. If the source is blurry, interpret the features to create a sharp, well-defined version that is clearly recognizable as the same character.

Scene Details:
1. Figurine: The figure version of the photo I gave you, with a clear representation of PVC material, placed on a round plastic base.
2. Packaging: Behind the figure, there should be a partially transparent plastic and paper box, with the character from the photo printed on it.
3. Environment: The entire scene should be in an indoor setting with good lighting.
```

### 手办化4
:::::tip 手办化4（与“手办化”同规格的替代表述）
- 场景：同“手办化”，可作 A/B Prompt
- 目标：一致输出质量下的表达冗余备选
- 适用范围：与手办化同
- 输入要求：主体照片
- 输出格式：与手办化同
- 备注：与“手办化”互为备选，便于对比效果
:::::

```
Please accurately transform the main subject in this photo into a realistic, masterpiece-like 1/7 scale PVC statue.
Behind this statue, a packaging box should be placed: the box has a large clear front window on its front side, and is printed with subject artwork, product name, brand logo, barcode, as well as a small specifications or authenticity verification panel. A small price tag sticker must also be attached to one corner of the box. Meanwhile, a computer monitor is placed at the back, and the monitor screen needs to display the ZBrush modeling process of this statue.
In front of the packaging box, this statue should be placed on a round plastic base. The statue must have 3D dimensionality and a sense of realism, and the texture of the PVC material needs to be clearly represented. If the background can be set as an indoor scene, the effect will be even better.

Below are detailed guidelines to note:
When repairing any missing parts, there must be no poorly executed elements.
When repairing human figures (if applicable), the body parts must be natural, movements must be coordinated, and the proportions of all parts must be reasonable.
If the original photo is not a full-body shot, try to supplement the statue to make it a full-body version.
The human figure's expression and movements must be exactly consistent with those in the photo.
The figure's head should not appear too large, its legs should not appear too short, and the figure should not look stunted—this guideline may be ignored if the statue is a chibi-style design.
For animal statues, the realism and level of detail of the fur should be reduced to make it more like a statue rather than the real original creature.
No outer outline lines should be present, and the statue must not be flat.
Please pay attention to the perspective relationship of near objects appearing larger and far objects smaller.
```

### 手办化5
:::::tip 手办化5（游戏截图角色→产品摄影风）
- 场景：游戏角色转 PVC 手办静物图
- 目标：微距产品摄影风，真实材质与柔和室内光影
- 适用范围：游戏角色/电竞周边
- 输入要求：游戏截图（包含姿势与造型）
- 输出格式：木质电脑桌室内场景，圆底座，柔光，浅景深
- 备注：强调“姿势精准复刻”
:::::

```
Realistic PVC figure based on the game screenshot character, exact pose replication highly detailed textures PVC material with subtle sheen and smooth paint finish, placed on an indoor wooden computer desk (with subtle desk items like a figure box/mouse), illuminated by soft indoor light (mix of desk lamp and natural window light) for realistic shadows and highlights, macro photography style,high resolution,sharp focus on the figure,shallow depth of field (desk background slightly blurred but visible), no stylization,true-to-reference color and design, 1:1scale.
```

### 六视图
:::::tip 六视图（标准工程视图）
- 场景：输出主体六面正交视图用于建模/生产
- 目标：前后左右上下等距排列，一致外形
- 适用范围：建模资料、3D 制作前置
- 输入要求：主体插画/照片（正视角优先）
- 输出格式：白底六视图，间距一致，等轴等效
- 备注：如有比例标尺更佳
:::::

```
Front, Rear, Left, Right, Top, Bottom views on white. Evenly spaced. Consistent subject. Isometric Perspective Equivalence.
```

### 表情包
:::::tip 表情包（Q版 3x3 贴纸风）
- 场景：以参考角色制作 9 宫格表情包
- 目标：统一风格、无文字或文字准确、贴纸白描边
- 适用范围：社交/社区用图
- 输入要求：参考角色插画
- 输出格式：3x3 网格，高分辨率，透明背景，1:1 构图
- 备注：可导出为独立切图
:::::

```
请创作一套以 [参考图片中的角色] 为主角的Q版表情包，共9个，排列成3x3网格。
设计要求：
- 透明背景。
- 1:1正方形构图。
- 统一的Q版吉卜力卡通风格，色彩鲜艳。
- 每个表情的动作、神态、内容各不相同，需要体现骚、贱、萌、抓狂等多样情绪，例如：翻白眼、捶地狂笑、灵魂出窍、原地石化、撒钱、干饭状态、社交恐惧发作等。可融入打工人和网络热梗元素。
- 每个表情形象完整，无残缺。
- 每个表情均带有统一的白色描边，呈现贴纸效果。
- 画面中无多余、分离的元素。
- 严格禁止出现任何文字，或确保文字内容准确无误（优先选择无文字）。
```

### cos化
:::::tip cos化（Comiket 现场写实照片）
- 场景：将插画角色转为真实 coser 的现场照片
- 目标：姿势/构图/角度严格一致，现场纪实氛围
- 适用范围：插画角色真人化可视化
- 输入要求：插画原图
- 输出格式：高细节现实风格，构图不偏离
- 备注：确保合规与公序良俗
:::::

```
Generate a highly detailed photo of a real-life girl cosplaying this illustration, at Comiket. Exactly replicate the same pose, body posture, hand gestures, facial expression, and camera framing as in the original illustration. Keep the same angle, perspective, and composition, without any deviation.
```

### 女友化
:::::tip 女友化（夜晚快餐店场景叙事）
- 场景：与女友化2同，但道具更丰富
- 目标：一致身份锁与高细节动漫风
- 适用范围：二次创作叙事插画
- 输入要求：人物照片
- 输出格式：电影式构图，桌面前景食物与道具
- 备注：避免风格不一致与身份变化
:::::

```
Use the attached image as the exact protagonist (identity lock). Keep her face, hairstyle, hair color, eye color, outfit, and accessories unchanged. Place her in a nighttime fast-food restaurant, sitting with a man in a white T-shirt; they are close and appear like a couple, with red cups and food on their table. In the foreground, a white oval plate holds a cheeseburger and golden fries, with condiment packets and a smartphone nearby. At another table in the scene, a shy young man sits alone, secretly glancing toward the couple with a subtle expression of longing and hidden affection, as if he has a crush on her. The background shows blurred urban night lights through the window, enhancing a romantic yet slightly bittersweet atmosphere. Keep the art style as highly detailed anime illustration, vibrant colors, soft shading, clean line art, and cinematic composition.no identity change, no gender swap, no face replacement, no hairstyle change, no generic anime girl, no photorealism, no style inconsistency
```

### 女友化2
:::::tip 女友化2（夜晚快餐店场景叙事）
- 场景：以照片人物为唯一主角，增加情节人物与道具
- 目标：保持人脸/装扮不变，叙事氛围与城市夜景
- 适用范围：二次创作叙事插画
- 输入要求：人物照片
- 输出格式：高细节动漫风、柔和光影、电影式构图
- 备注：遵循“身份锁”，不更换面容与造型
:::::

```
Use the attached image as the exact protagonist (identity lock). Keep her face, hairstyle, hair color, eye color, outfit, and accessories exactly the same without alteration. Do not change her facial features or expression style. Place her in a nighttime fast-food restaurant, sitting with a man in a white T-shirt as if they are a couple, with food and red cups on the table. At another table, a shy young man sits alone, secretly glancing toward her with hidden affection. The background shows blurred urban night lights through the window, enhancing a romantic yet slightly bittersweet atmosphere. Keep the art style as highly detailed anime illustration, vibrant colors, soft shading, clean line art, and cinematic composition.no identity change, no face change, no new facial expressions, no gender swap, no photorealism, no generic anime girl, no style inconsistency
```
