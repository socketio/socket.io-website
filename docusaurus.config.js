const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

const helpItems = [
  {
    // using 'type: "doc"' makes the link active whenever the user is on a page from the "/docs" directory
    // see: https://github.com/facebook/docusaurus/issues/8018
    label: "Troubleshooting",
    to: "/docs/v4/troubleshooting-connection-issues/",
  },
  {
    label: "Stack Overflow",
    href: "https://stackoverflow.com/questions/tagged/socket.io",
  },
  {
    label: "GitHub Discussions",
    href: "https://github.com/socketio/socket.io/discussions",
  },
  {
    label: "Slack",
    href: "https://socketio-slackin.herokuapp.com/",
  },
];

const toolsItems = [
  {
    label: "CDN",
    href: "https://cdn.socket.io",
  },
  {
    label: "Admin UI",
    href: "https://admin.socket.io",
  },
];

const newsItems = [
  {
    label: "Blog",
    to: "/blog",
  },
  {
    label: "Twitter",
    href: "https://twitter.com/SocketIO",
  },
];

const aboutItems = [
  {
    label: "FAQ",
    to: "/docs/v4/faq/",
  },
  {
    label: "Changelog",
    to: "/docs/v4/changelog/",
  },
  {
    label: "Roadmap",
    href: "https://github.com/orgs/socketio/projects/3",
  },
  {
    label: "Become a sponsor",
    href: "https://opencollective.com/socketio",
  },
];

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: "Socket.IO",
  tagline: "Dinosaurs are cool",
  url: "https://socket.io",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "images/favicon.png",
  organizationName: "socketio",
  projectName: "socket.io",
  themeConfig: {
    navbar: {
      title: "Socket.IO",
      hideOnScroll: true,
      logo: {
        alt: "Socket.IO logo",
        src: "images/logo.svg",
        srcDark: "images/logo-dark.svg",
      },
      items: [
        {
          type: "dropdown",
          label: "Docs",
          position: "left",
          items: [
            {
              type: "doc",
              label: "Guide",
              docId: "categories/Documentation/index",
            },
            {
              type: "doc",
              label: "Tutorial",
              docId: "tutorial/introduction",
            },
            {
              label: "Examples",
              to: "/get-started/",
            },
            {
              type: "doc",
              label: "Emit cheatsheet",
              docId: "emit-cheatsheet"
            }
          ]
        },
        {
          type: "doc",
          docId: "server-api",
          position: "left",
          label: "Server API",
        },
        {
          type: "doc",
          docId: "client-api",
          position: "left",
          label: "Client API",
        },
        {
          type: "dropdown",
          label: "Ecosystem",
          position: "left",
          items: [
            {
              type: "html",
              className: "dropdown-category",
              value: "<b>Help</b>",
            },
            ...helpItems,
            {
              type: "html",
              value: '<hr class="dropdown-separator">',
            },
            {
              type: "html",
              className: "dropdown-category",
              value: "<b>News</b>",
            },
            ...newsItems,
            {
              type: "html",
              value: '<hr class="dropdown-separator">',
            },
            {
              type: "html",
              className: "dropdown-category",
              value: "<b>Tools</b>",
            },
            ...toolsItems,
          ],
        },
        {
          type: "dropdown",
          label: "About",
          position: "left",
          items: aboutItems,
        },
        {
          type: "docsVersionDropdown",
          position: "right",
          dropdownItemsAfter: [
            {
              type: "html",
              value: '<hr class="dropdown-separator">',
            },
            {
              label: "Changelog",
              to: "/docs/v4/changelog/",
              activeBaseRegex: 'never',
            }
          ],
        },
        {
          type: "localeDropdown",
          position: "right",
        },
        {
          href: "https://github.com/socketio/socket.io",
          position: "right",
          className: "header-github-link",
          "aria-label": "GitHub repository",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Documentation",
          items: [
            {
              label: "Guide",
              to: "/docs/v4/",
            },
            {
              label: "Tutorial",
              to: "/docs/v4/tutorial/introduction",
            },
            {
              label: "Examples",
              to: "/get-started/",
            },
            {
              label: "Server API",
              to: "/docs/v4/server-api/",
            },
            {
              label: "Client API",
              to: "/docs/v4/client-api/",
            },
          ],
        },
        {
          title: "Help",
          items: helpItems,
        },
        {
          title: "News",
          items: newsItems,
        },
        {
          title: "Tools",
          items: toolsItems,
        },
        {
          title: "About",
          items: aboutItems,
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Socket.IO`,
    },
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
    },
    algolia: {
      apiKey: "bcf148e965eaca9ed2e6868a50a9e42c",
      appId: "ZM7QMFKQCJ",
      indexName: "socket_io",
    },
    announcementBar: {
      content:
        'Latest blog post (July 25, 2024): <a href="/blog/npm-package-provenance/">npm package provenance</a>.',
      backgroundColor: "#25c2a0",
      isCloseable: true,
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          showLastUpdateTime: true,
          editUrl: "https://github.com/socketio/socket.io-website/edit/main/",
          lastVersion: "current",
          versions: {
            current: {
              label: "4.x",
              path: "v4",
            },
            "3.x": {
              label: "3.x",
              path: "v3",
            },
            "2.x": {
              label: "2.x",
              path: "v2",
            },
          },
          sidebarItemsGenerator({
            isCategoryIndex: defaultCategoryIndexMatcher,
            defaultSidebarItemsGenerator,
            ...args
          }) {
            return defaultSidebarItemsGenerator({
              ...args,
              isCategoryIndex() {
                return false;
              },
            });
          },
        },
        blog: {
          showReadingTime: true,
          editUrl: "https://github.com/socketio/socket.io-website/edit/main/",
          blogSidebarCount: 10,
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
  i18n: {
    defaultLocale: "en",
    locales: ["en", "es", "fr", "pt-br", "zh-CN"],
  }
};
