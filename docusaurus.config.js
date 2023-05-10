const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

const helpItems = [
  {
    // using 'type: "doc"' makes the link active whenever the user is on a page from the "/docs" directory
    // see: https://github.com/facebook/docusaurus/issues/8018
    label: "Troubleshooting",
    to: "/docs/v4/troubleshooting-connection-issues/"
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
  }
];

const newsItems = [
  {
    label: "Blog",
    to: "/blog"
  },
  {
    label: "Twitter",
    href: "https://twitter.com/SocketIO",
  },
];

const aboutItems = [
  {
    label: "Changelog",
    to: "/docs/v4/changelog"
  },
  {
    label: "Roadmap",
    href: "https://github.com/socketio/socket.io/projects/3"
  },
  {
    label: "Become a sponsor",
    href: "https://opencollective.com/socketio",
  },
]

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
        srcDark: "images/logo-dark.svg"
      },
      items: [
        {
          type: "doc",
          docId: "categories/Documentation/index",
          position: "left",
          label: "Documentation",
        },
        {
          position: "left",
          label: "Examples",
          to: "/get-started/"
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
          items: aboutItems
        },
        {
          type: "docsVersionDropdown",
          position: "right"
        },
        {
          type: "localeDropdown",
          position: "right"
        },
        {
          href: "https://github.com/socketio/socket.io",
          position: "right",
          className: "header-github-link",
        }
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Documentation",
          items: [
            {
              label: "Get started",
              to: "/get-started/chat",
            },
            {
              label: "Documentation",
              to: "/docs/v4/"
            },
            {
              label: "Examples",
              to: "/get-started/"
            },
            {
              label: "Server API",
              to: "/docs/v4/server-api/"
            },
            {
              label: "Client API",
              to: "/docs/v4/client-api/"
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
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
    },
    algolia: {
      apiKey: 'bcf148e965eaca9ed2e6868a50a9e42c',
      appId: 'ZM7QMFKQCJ',
      indexName: 'socket_io'
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          showLastUpdateTime: true,
          editUrl:
            "https://github.com/socketio/socket.io-website/edit/main/",
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
    defaultLocale: 'en',
    locales: ['en', 'fr', 'pt-br', 'zh-CN'],
  },
  scripts: [
    {
      src: '/_vercel/insights/script.js',
      defer: true,
    }
  ]
};
