import type { PluginOption } from 'vite'
import type { HeadConfig, SiteConfig } from 'vitepress'
import type { UmamiPluginOptions } from './type'

export function UmamiPlugin(options: UmamiPluginOptions): any {
  console.log('Initializing Umami Plugin with options:', JSON.stringify(options, null, 2))

  let resolveConfig: any
  let vitepressConfig: SiteConfig

  const { apply = 'build' } = options
  console.log('Apply mode:', apply, 'Current NODE_ENV:', process.env.NODE_ENV)

  const pluginOps: PluginOption = {
    name: 'vitepress-plugin-umami',
    enforce: 'pre',
    ...apply === 'all' ? {} : { apply },
    configResolved(config: any) {
      console.log('Plugin configResolved called, apply mode:', apply)
      
      if (resolveConfig) {
        return
      }
      resolveConfig = config

      vitepressConfig = config.vitepress
      if (!vitepressConfig) {
        console.log('No vitepress config found')
        return
      }

      console.log('VitePress config found, setting up transformPageData')
      const selfTransformPageData = vitepressConfig.transformPageData
      vitepressConfig.transformPageData = async (pageData, ctx) => {
        console.log('transformPageData called for:', pageData.relativePath)
        pageData.frontmatter.head ??= []
        const scriptHeads = getUmamiScriptHead(options)
        console.log('Adding Umami script heads:', JSON.stringify(scriptHeads, null, 2))
        pageData.frontmatter.head.push(...scriptHeads)
        return selfTransformPageData?.(pageData, ctx)
      }
    }
  }
  return pluginOps
}

export function getUmamiScriptHead(options: UmamiPluginOptions): HeadConfig[] {
  const { 
    websiteId, 
    hostUrl = 'https://analytics.umami.is/script.js', 
    async = true, 
    autoTrack = true,
    spa = true,
    cache = true,
    domains,
    dataAttributes
  } = options
  
  if (!websiteId) {
    return []
  }

  const scriptAttrs: Record<string, string> = {
    src: hostUrl,
    'data-website-id': websiteId,
    async: async ? 'true' : 'false'
  }

  // Add optional attributes
  if (!autoTrack) {
    scriptAttrs['data-auto-track'] = 'false'
  }

  if (spa) {
    scriptAttrs['data-spa'] = 'true'
  }

  if (cache === false) {
    scriptAttrs['data-cache'] = 'false'
  }

  if (domains && domains.length > 0) {
    scriptAttrs['data-domains'] = domains.join(',')
  }

  // Add any custom data attributes
  if (dataAttributes) {
    Object.entries(dataAttributes).forEach(([key, value]) => {
      scriptAttrs[`data-${key}`] = value
    })
  }

  return [
    [
      'script',
      scriptAttrs
    ]
  ]
}

export * from './type'