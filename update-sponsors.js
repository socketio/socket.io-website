#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const request = require("request-promise");

const filename = "sponsors.json";
const absoluteFilename = path.resolve(__dirname, filename);

const graphqlEndpoint = "https://api.opencollective.com/graphql/v2";

function createGraphqlQuery(page, pageSize) {
  const offset = (page - 1) * pageSize;
  return `query account {
    account(slug: "socketio") {
      members(role: BACKER, offset: ${offset}, limit: ${pageSize}) {
        nodes {
          tier {
            name
          }
          account {
            id
            name
            slug
            website
            socialLinks {
              type
              url
            }
            imageUrl(format: jpg)
          }
          totalDonations {
            value
          }
          since
          isActive
        }
      }
    }
  }`;
}

const customImages = new Map([
  [
    "skweezer-net",
    {
      url: "https://skweezer.net/buy-instagram-followers",
      img: "/images/sponsors/skweezer-net.png",
      alt: "visit skweezer to buy instagram followers today",
    },
  ],
  [
    "route4me",
    {
      url: "https://route4me.com",
      img: "/images/sponsors/route4me.png",
      alt: "Route Planner and Route Optimizer",
    },
  ],
  [
    "user-62981c05",
    {
      url: "https://superviral.io/",
      img: "/images/sponsors/superviral.jpg",
      alt: "Superviral",
    },
  ],
  [
    "gem-m",
    {
      url: "https://www.noneedtostudy.com/take-my-online-class/",
      img: "/images/sponsors/noneedtostudy.png",
      alt: "Pay someone to take my online class - NoNeedToStudy.com",
    },
  ],
  [
    "softorbits",
    {
      url: "https://www.softorbits.net/ai-undresser/",
      img: "/images/sponsors/softorbits.png",
      alt: "Undress AI by SoftOrbits",
    }
  ]
]);

const customLinks = {
  "casinotest-ltd": {
    url: "https://www.casinotest.com/",
    img: "https://images.opencollective.com/casinotest-ltd/7e3c899/logo.png",
    alt: "CasinoTest Ltd.",
  },
  "veepn-vpn": {
    url: "https://veepn.com/vpn-apps/download-vpn-for-pc/",
    img: "https://images.opencollective.com/veepn-vpn/5e3715a/avatar.png",
    alt: "VeePN VPN",
  },
};

const nodeToSponsor = (node) =>
  customLinks[node.account.slug] || {
    url:
      node.account.socialLinks.find((link) => link.type === "WEBSITE")?.url ||
      node.account.website,
    img: node.account.imageUrl,
    alt: node.account.name,
  };

function monthDiff(dateFrom, dateTo) {
  return (
    dateTo.getMonth() -
    dateFrom.getMonth() +
    12 * (dateTo.getFullYear() - dateFrom.getFullYear())
  );
}

const NOW = new Date();
const AMOUNT_PER_MONTH = 100;

function sortByTotalDonationsOrStartDate(a, b) {
  const sortByDonations = b.totalDonations.value - a.totalDonations.value;
  const isSufficientDiff = Math.abs(sortByDonations) > AMOUNT_PER_MONTH;

  if (isSufficientDiff) {
    return sortByDonations;
  }

  return a.since.localeCompare(b.since);
}

const main = async () => {
  console.log(`fetching sponsors from the graphql API`);

  const validMembers = new Map();

  for (let i = 1; i < 20; i++) {
    const result = await request({
      method: "POST",
      uri: graphqlEndpoint,
      body: { query: createGraphqlQuery(i, 500) },
      json: true,
    });

    const sponsors = result.data.account.members.nodes;

    console.log(`fetched ${sponsors.length} sponsors (page #${i})`);

    if (sponsors.length === 0) {
      break;
    }

    sponsors
      .map((node) => {
        const customImage = customImages.get(node.account.slug);
        if (customImage) {
          if (customImage.img) {
            node.account.imageUrl = customImage.img;
          }
          if (customImage.url) {
            node.account.website = customImage.url;
          }
          if (customImage.alt) {
            node.account.name = customImage.alt;
          }
        }
        return node;
      })
      .filter((node) => {
        const isSubscriptionActive =
          node.tier && node.tier.name === "Sponsors" && node.isActive;
        const totalDonations = node.totalDonations.value;
        const durationInMonths = monthDiff(new Date(node.since), NOW);
        const hasSufficientOneTimeDonation =
          totalDonations / durationInMonths >= AMOUNT_PER_MONTH;
        const hasWebsite =
          node.account.socialLinks.some((link) => link.type === "WEBSITE") ||
          node.account.website; // website attribute is deprecated but still used in some cases

        if (
          (isSubscriptionActive || hasSufficientOneTimeDonation) &&
          !hasWebsite
        ) {
          console.log(
            `${node.account.name} (https://opencollective.com/${node.account.slug}) has no website`,
          );
        }

        return (
          (isSubscriptionActive || hasSufficientOneTimeDonation) && hasWebsite
        );
      })
      .forEach((node) => {
        if (!validMembers.has(node.account.id)) {
          // prevent duplicates, as some sponsors appear twice with { "tier": null } and { "tier": { "name": "Sponsors" }}
          validMembers.set(node.account.id, node);
        }
      });
  }

  const activeSponsors = [...validMembers.values()]
    .sort(sortByTotalDonationsOrStartDate)
    .map(nodeToSponsor);

  console.log(`found ${activeSponsors.length} active sponsors`);

  fs.writeFileSync(absoluteFilename, JSON.stringify(activeSponsors, null, 2));
  console.log(`content written to ${absoluteFilename}`);
};

main();
