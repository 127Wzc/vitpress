import { defineConfig } from "vitepress";
import { UmamiPlugin } from 'vitepress-plugin-umami'
// 导入主题的配置
import { blogTheme } from "./blog-theme";

// 域名环境变量
const DOMAIN = process.env.VITE_DOMAIN || 'clannad.me';

// 如果使用 GitHub/Gitee Pages 等公共平台部署
// 通常需要修改 base 路径，通常为"/仓库名/"
// 如果项目名已经为 name.github.io 域名，则不需要修改！
// const base = process.env.GITHUB_ACTIONS === 'true'
//   ? '/vitepress-blog-sugar-template/'
//   : '/'

// Vitepress 默认配置
// 详见文档：https://vitepress.dev/reference/site-config
export default defineConfig({
  // 继承博客主题(@sugarat/theme)
  extends: blogTheme,
  // base,
  lang: "zh-cn",
  title: "小c",
  description: "基于粥里有勺糖的博客主题，基于 vitepress 实现",
  lastUpdated: true,
  // 详见：https://vitepress.dev/zh/reference/site-config#head
  head: [
    // 配置网站的图标（显示在浏览器的 tab 上）
    // ['link', { rel: 'icon', href: `${base}favicon.ico` }], // 修改了 base 这里也需要同步修改
    ["link", { rel: "icon", href: "/favicon.ico" }],
  ],
  themeConfig: {
    // 展示 2,3 级标题在目录中
    outline: {
      level: [2, 3],
      label: "目录",
    },
    // 默认文案修改
    returnToTopLabel: "回到顶部",
    sidebarMenuLabel: "相关文章",
    lastUpdatedText: "上次更新于",

    // 设置logo
    logo: "/logo.png",
    // editLink: {
    //   pattern:
    //     'https://github.com/ATQQ/sugar-blog/tree/master/packages/blogpress/:path',
    //   text: '去 GitHub 上编辑内容'
    // },
    nav: [
      { text: "首页",
        link: "/" 
      },
      { 
        text: "编程", 
        items: [
          { text: "Java", link: "/coding/java/" },
          { text: "Shell", link: "/coding/shell/" },
        ]
      },
      { 
        text: "数据库", 
        items: [
          { text: "MySql", link: "/db/mysql/" },
          { text: "PostgreSQL", link: "/db/postgresql/" }
        ]
      },
      { 
        text: "运维", 
        items: [
          { text: "Docker", link: "/ops/docker/" },
          { text: "Git", link: "/ops/git/" },
          { text: "Linux", link: "/ops/linux/" },
        ]
      },
      { 
        text: "个人服务", 
        items: [
          { text: "个人图床", link: `https://imgbed.${DOMAIN}` },
          { text: "open-webui", link: `https://open-webui.${DOMAIN}` },
          { text: "一起看电影", link: `https://tv.${DOMAIN}` },
          { text: "临时邮箱", link: `https://mail.${DOMAIN}` },
          { text: "表情包制作文档", link: `https://meme.${DOMAIN}/docs` },
          { text: "服务监控面板", link: `https://uk.${DOMAIN}/status/web` }
        ]
      },
      { text: "关于主题", 
        link: "/about" 
      }
    ],
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/127Wzc/vitpress",
      },
    ],
  },
  vite: {
    plugins: [
      UmamiPlugin({
        websiteId: process.env.VITE_UMAMI_WEBSITE_ID || '', // 替换为您的 Umami 网站 ID
        hostUrl: process.env.VITE_UMAMI_HOST_URL || '', // 替换为您的 Umami 网站js
        
        // 可选配置
        apply: 'all',        // 在开发和构建环境都启用
        async: true         // 异步加载脚本
      })
      // ... 其他 Vite 插件 ...
    ]
  }
});
