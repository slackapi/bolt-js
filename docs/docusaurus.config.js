import { themes as prismThemes } from 'prism-react-renderer';
const footer = require('./footerConfig');
const navbar = require('./navbarConfig');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Bolt for JavaScript',
  tagline: 'Official frameworks, libraries, and SDKs for Slack developers',
  favicon: 'img/favicon.ico',
  url: 'https://tools.slack.dev',
  baseUrl: '/bolt-js/',
  organizationName: 'slackapi',
  projectName: 'bolt-js',

  onBrokenLinks: 'warn',
  onBrokenAnchors: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ja-jp'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: 'content',
          breadcrumbs: false,
          routeBasePath: '/', // Serve the docs at the site's root
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/slackapi/bolt-js/tree/main/docs',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  plugins: [
    'docusaurus-theme-github-codeblock',
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          {
            to: '/getting-started',
            from: ['/tutorial/getting-started', '/tutorial/getting-started-http'],
          },
          {
            to: '/legacy/steps-from-apps',
            from: [
              '/concepts/steps',
              '/concepts/creating-steps',
              '/concepts/adding-editing-steps',
              '/concepts/saving-steps',
              '/concepts/executing-steps',
            ],
          },
          {
            to: '/concepts/actions',
            from: ['/concepts/action-listening', '/concepts/action-responding'],
          },
          {
            to: '/',
            from: ['/concepts', '/concepts/advanced', '/concepts/basic'],
          },
          {
            to: '/concepts/ai-apps',
            from: '/concepts/assistant',
          },
        ],
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        respectPrefersColorScheme: true,
      },
      docs: {
        sidebar: {
          autoCollapseCategories: true,
        },
      },
      navbar,
      footer,
      prism: {
        // switch to alucard when available in prism?
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash'],
      },
      codeblock: {
        showGithubLink: true,
        githubLinkLabel: 'View on GitHub',
      },
      // announcementBar: {
      //   id: `announcementBar`,
      //   content: `🎉️ <b><a target="_blank" href="https://api.slack.com/">Version 2.26.0</a> of the developer tools for the Slack automations platform is here!</b> 🎉️ `,
      // },
    }),
};

export default config;
