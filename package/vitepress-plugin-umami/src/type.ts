export interface UmamiPluginOptions {
  /**
   * Umami website ID
   */
  websiteId: string
  /**
   * URL to your Umami instance
   * @default 'https://analytics.umami.is/script.js'
   */
  hostUrl?: string
  /**
   * 生效阶段
   * @default 'build'
   * @doc 'build' 构建时生效，'serve' 开发时生效，'all' 所有阶段生效
   */
  apply?: 'build' | 'serve' | 'all'
  /**
   * 异步加载脚本
   * @default true
   */
  async?: boolean
  /**
   * 禁用自动跟踪页面浏览量
   * @default false
   */
  autoTrack?: boolean
  /**
   * 使用单页面应用统计，如使用了Vue / React等框架构建的单页面应用网站
   * @default true
   */
  spa?: boolean
  /**
   * 自定义数据属性
   */
  dataAttributes?: Record<string, string>
  /**
   * 缓存
   * @default true
   */
  cache?: boolean
  /**
   * 域名
   */
  domains?: string[]
}