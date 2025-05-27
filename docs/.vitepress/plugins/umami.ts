import type { Plugin } from 'vite';

export interface UmamiPluginOptions {
  /**
   * Umami 网站 ID
   */
  websiteId: string;
  
  /**
   * Umami 脚本地址
   * @default 'https://analytics.umami.is/script.js'
   */
  scriptSrc?: string;
  
  /**
   * 托管Umami的主机地址，与scriptSrc二选一
   * @example 'https://analytics.example.com'
   */
  hostUrl?: string;
  
  /**
   * 生效阶段
   * @default 'build'
   * @doc 'build' 构建时生效，'serve' 开发时生效，'all' 所有阶段生效
   */
  apply?: 'build' | 'serve' | 'all';
  
  /**
   * 引入方式
   * @default 'async'
   * @doc 'async' 异步加载，'defer' 延迟加载
   */
  importMode?: 'async' | 'defer';
  
  /**
   * 是否自动追踪页面浏览
   * @default true
   */
  autoTrack?: boolean;
  
  /**
   * 数据收集域名 
   * @default 'auto'
   */
  domains?: string | string[];
  
  /**
   * 是否禁用在开发环境使用
   * @default true
   */
  disableInDev?: boolean;
}

/**
 * 生成Umami统计代码
 */
function generateUmamiCode(options: UmamiPluginOptions): string {
  const {
    websiteId,
    scriptSrc = 'https://analytics.umami.is/script.js',
    importMode = 'async',
    autoTrack = true,
    domains = 'auto',
  } = options;
  
  // 处理脚本URL
  const scriptUrl = options.hostUrl 
    ? `${options.hostUrl.replace(/\/$/, '')}/script.js` 
    : scriptSrc;
    
  // 构建数据属性
  const dataAttrs = [`data-website-id="${websiteId}"`];
  
  if (!autoTrack) {
    dataAttrs.push('data-auto-track="false"');
  }
  
  if (domains !== 'auto') {
    const domainsValue = Array.isArray(domains) 
      ? domains.join(',') 
      : domains;
    dataAttrs.push(`data-domains="${domainsValue}"`);
  }
  
  // 生成脚本标签
  return `<script src="${scriptUrl}" ${importMode} ${dataAttrs.join(' ')}></script>`;
}

/**
 * VitePress Umami 统计插件
 */
export function UmamiPlugin(options: UmamiPluginOptions): Plugin {
  return {
    name: 'vitepress-plugin-umami',
    
    transformIndexHtml(html: string) {
      // 判断是否需要在当前环境下应用
      const isDev = process.env.NODE_ENV === 'development';
      const shouldApply = 
        options.apply === 'all' || 
        (options.apply === 'build' && !isDev) || 
        (options.apply === 'serve' && isDev);
      
      // 开发环境下是否禁用
      if (isDev && options.disableInDev !== false) {
        return html;
      }
      
      if (!shouldApply) {
        return html;
      }
      
      // 生成统计代码并注入到</head>前
      const umamiCode = generateUmamiCode(options);
      return html.replace('</head>', `${umamiCode}</head>`);
    }
  };
} 