/**
 * 站点统一配置
 * 集中管理域名配置，供 VitePress、SCSS、Markdown 等统一使用
 */

// 主域名
export const DOMAIN = process.env.VITE_DOMAIN || '559558.xyz';

// 图床完整地址
export const PIC_URL = `https://pic.${DOMAIN}`;

// 服务域名
export const SERVICES = {
    imgbed: `https://imgbed.${DOMAIN}`,
    imgTagbed: `https://imag-tag.${DOMAIN}`,
    mail: `https://mail.${DOMAIN}`,
    meme: `https://meme.${DOMAIN}/docs`,
    status: `https://uk.${DOMAIN}/status/web`,
};

// SCSS 变量注入
export const scssVariables = `$domain: "${DOMAIN}";`;

// Markdown 占位符替换规则
export const markdownReplacements: [RegExp, string][] = [
    [/\{\{PIC_URL\}\}/g, PIC_URL],
];
