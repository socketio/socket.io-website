const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

const communityItems = [
  {
    label: "Blog",
    to: "/blog"
  },
  {
    label: "GitHub",
    href: "https://github.com/socketio/socket.io",
  },
  {
    label: "Slack",
    href: "https://socketio-slackin.herokuapp.com/",
  },
  {
    label: "Stack Overflow",
    href: "https://stackoverflow.com/questions/tagged/socket.io",
  },
  {
    label: "Twitter",
    href: "https://twitter.com/SocketIO",
  },
  {
    label: "Become a sponsor",
    href: "https://opencollective.com/socketio",
  },
];

const resourcesItems = [
  {
    label: "CDN",
    href: "https://cdn.socket.io",
  },
  {
    label: "Admin UI",
    href: "https://admin.socket.io",
  }
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
          type: "docsVersionDropdown",
          position: "left"
        },
        {
          type: "doc",
          docId: "categories/Documentation/index",
          position: "left",
          label: "Documentation",
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
          label: "Community",
          position: "right",
          items: communityItems
        },
        {
          type: "dropdown",
          label: "Resources",
          position: "right",
          items: resourcesItems,
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
              label: "Get started",
              to: "/get-started/chat",
            },
            {
              label: "Documentation",
              to: "/docs/v4/"
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
          title: "Community",
          items: communityItems,
        },
        {
          title: "More",
          items: resourcesItems,
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Socket.IO`,
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
    },
    algolia: {
      apiKey: '58123f8fe0926bd32287730dbc483f6d',
      indexName: 'socket_io',
      contextualSearch: false, // temporary fix until the "docusaurus_tag" facet is taken in account
      searchParameters: {
        facetFilters: ["language:en", "version:v4"]
      }
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl:
            "https://github.com/socketio/socket.io-website/edit/master/",
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
        },
        blog: {
          showReadingTime: true,
          editUrl: "https://github.com/socketio/socket.io-website/edit/master/",
          blogSidebarCount: 10,
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
};
