# VitePress Plugin for Umami Analytics

A VitePress plugin to easily integrate [Umami Analytics](https://umami.is/) into your VitePress site.

## Installation

```bash
npm install vitepress-plugin-umami
```

## Usage

In your VitePress configuration file (e.g., `.vitepress/config.ts`), import and use the plugin:

```ts
import { defineConfig } from 'vitepress'
import { UmamiPlugin } from 'vitepress-plugin-umami'

export default defineConfig({
  // ... other VitePress configurations
  vite: {
    plugins: [
      UmamiPlugin({
        websiteId: 'your-umami-website-id',
        hostUrl: 'https://your-umami-instance.com/script.js'
      })
    ]
  }
})
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `websiteId` | `string` | **Required** | Your Umami website ID |
| `hostUrl` | `string` | `'https://analytics.umami.is/script.js'` | URL to your Umami instance |
| `apply` | `'build'` \| `'serve'` \| `'all'` | `'build'` | When to apply the plugin: during build, development, or both |
| `async` | `boolean` | `true` | Whether to load the script asynchronously |
| `autoTrack` | `boolean` | `true` | Whether to automatically track page views |
| `spa` | `boolean` | `true` | Whether to enable single-page application tracking |
| `cache` | `boolean` | `true` | Whether to enable caching |
| `domains` | `string[]` | `undefined` | List of domains to track |
| `dataAttributes` | `Record<string, string>` | `undefined` | Custom data attributes to add to the script tag |

## Example with All Options

```ts
import { defineConfig } from 'vitepress'
import { UmamiPlugin } from 'vitepress-plugin-umami'

export default defineConfig({
  vite: {
    plugins: [
      UmamiPlugin({
        websiteId: 'your-umami-website-id',
        hostUrl: 'https://your-umami-instance.com/script.js',
        apply: 'all',
        async: true,
        autoTrack: true,
        spa: true,
        cache: true,
        domains: ['example.com', 'www.example.com'],
        dataAttributes: {
          'custom-attr': 'value'
        }
      })
    ]
  }
})
```

## License

MIT 