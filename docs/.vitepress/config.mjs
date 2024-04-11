import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "GENUN API Documentation",
  description: "General documentation for 3rd party partner invoke GENUN.tech platform with API and SDK.",
  base: '/docs/',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'SDK Guide', link: '/guide-sdk' }
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'About GENU.N Platform', link: '/'},
          { text: 'Open Platform Overview', link: '/platform-overview'},
          { text: 'GENU.N Client SDK', link: '/platform-sdk'}
        ]
      },
      {
        text: 'SDK Guide',
        items: [
          { text: 'API Reference', link: '/guide-sdk' },
          { text: 'Examples', link: '/guide-examples'}
        ]
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],
  }
})
