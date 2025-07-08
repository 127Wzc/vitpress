// 主题独有配置
import { getThemeConfig } from '@sugarat/theme/node'

//开启RSS支持（RSS配置）
import type { Theme } from '@sugarat/theme'

// 域名环境变量
const DOMAIN = process.env.VITE_DOMAIN || 'clannad.me';
const baseUrl = `https://blog.${DOMAIN}`
const RSS: Theme.RSSOptions = {
  title: '小c',
  baseUrl,
  copyright: 'Copyright (c) 2024-present, 小c',
  description: '君子终日乾乾，夕惕若厉，无咎',
  language: 'zh-cn',
  image: `${baseUrl}/logo.png`,
  favicon: `${baseUrl}/favicon.ico`,
}

// 所有配置项，详见文档: https://theme.sugarat.top/
const blogTheme = getThemeConfig({
  // 开启RSS支持
  RSS,

  // 搜索
  // 默认开启pagefind离线的全文搜索支持（如使用其它的可以设置为false）
  // search: true,

  // 页脚
  footer: {
    // message 字段支持配置为HTML内容，配置多条可以配置为数组
    // message: '下面 的内容和图标都是可以修改的噢（当然本条内容也是可以隐藏的）',
    copyright: 'MIT License | 小c',
    // icpRecord: {
    //   name: '蜀ICP备19011724号',
    //   link: 'https://beian.miit.gov.cn/'
    // },
    // securityRecord: {
    //   name: '公网安备xxxxx',
    //   link: 'https://www.beian.gov.cn/portal/index.do'
    // },
  },

  // 主题色修改
  themeColor: 'el-blue',

  // 文章默认作者
  author: '小c',
  // Mermaid - 图表
  mermaid: true,
  //日期
  formatShowDate(date) {
    return new Date(date).toLocaleDateString()
  },

  // 友链
  friend: [
    {
      nickname: '粥里有勺糖',
      des: '你的指尖用于改变世界的力量',
      avatar:
        'https://img.cdn.sugarat.top/mdImg/MTY3NDk5NTE2NzAzMA==674995167030',
      url: 'https://sugarat.top',
    },
    {
      nickname: 'Vitepress',
      des: 'Vite & Vue Powered Static Site Generator',
      avatar:
        'https://vitepress.dev/vitepress-logo-large.webp',
      url: 'https://vitepress.dev/',
    },
  ],

  // 公告
  // popover: {
  //   title: '公告',
  //   body: [
  //     { type: 'text', content: '👇QQ👇---👇 微信 👇' },
  //     {
  //       type: 'image',
  //       src: `https://pic.${DOMAIN}/blog/qrcode.png`
  //     },
  //     {
  //       type: 'text',
  //       content: '欢迎大家加群&私信交流'
  //     },
  //     // {
  //     //   type: 'text',
  //     //   content: '文章首/文尾有群二维码',
  //     //   style: 'padding-top:0'
  //     // },
  //     // {
  //     //   type: 'button',
  //     //   content: '作者博客',
  //     //   link: 'https://sugarat.top'
  //     // },
  //     // {
  //     //   type: 'button',
  //     //   content: '加群交流',
  //     //   props: {
  //     //     type: 'success'
  //     //   },
  //     //   link: 'https://theme.sugarat.top/group.html',
  //     // }
  //   ],
  //   duration: 0
  // },

   // 推荐文章的展示卡片
  recommend: {
    showSelf: true,
    nextText: '下一页',
    style: 'sidebar'
  },
   // 热门文章
  hotArticle: {
    pageSize: 12
  },

  //评论
  comment: {
    type: 'giscus',
    options: {
      repo: '127Wzc/cc-giscus',
      repoId: process.env.VITE_GISCUS_REPO_ID || '',
      category: 'Announcements',
      categoryId: 'DIC_kwDONXwvLM4CkzqF',
      inputPosition: 'top'
    },
    mobileMinify: true
  },
  //live2d
  oml2d: {
    mobileDisplay: true,
    models: [
      {
        path: 'https://model.hacxy.cn/mai/model.json'
      },
      {
        path: 'https://model.hacxy.cn/bilibili-22/index.json'
      },
      {
        path: 'https://model.hacxy.cn/HK416-1-normal/model.json'
      },
      {
        path: 'https://model.hacxy.cn/kobayaxi/model.json'
      },
      {
        path: 'https://model.hacxy.cn/platelet/model.json'
      },
      {
        path: 'https://model.hacxy.cn/rem/model.json'
      },
      {
        path: 'https://model.hacxy.cn/umaru/model.json'
      }
    ]
  },

 
})

export { blogTheme }
