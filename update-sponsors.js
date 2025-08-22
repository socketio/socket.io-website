#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const request = require('request-promise');

const filename = 'sponsors.json';
const absoluteFilename = path.resolve(__dirname, filename);

const graphqlEndpoint = 'https://api.opencollective.com/graphql/v2';

const graphqlQuery = `query account {
  account(slug: "socketio") {
    orders(status: [ACTIVE, PAID], minAmount: 10000, limit: 1000) {
      nodes {
        fromAccount {
          id
        }
        status
        processedAt
        totalAmount {
          value
        }
      }
    }
    members(role: BACKER, limit: 1000) {
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
        createdAt
      }
    }
  }
}`;

const customImages = new Map([
  ["skweezer-net", { url: "https://skweezer.net/buy-instagram-followers", img: "/images/sponsors/skweezer-net.png", alt: "visit skweezer to buy instagram followers today" }],
  ["route4me", { url: "https://route4me.com", img: "/images/sponsors/route4me.png", alt: "Route Planner and Route Optimizer" }],
  ["user-62981c05", { url: "https://superviral.io/", img: "/images/sponsors/superviral.jpg", alt: "Superviral" }],
]);

const customLinks = {
  "casinotest-ltd": {
    url: "https://www.casinotest.com/",
    img: "https://images.opencollective.com/casinotest-ltd/7e3c899/logo.png",
    alt: "CasinoTest Ltd."
  },
  "veepn-vpn": {
    url: "https://veepn.com/vpn-apps/download-vpn-for-pc/",
    img: "https://images.opencollective.com/veepn-vpn/5e3715a/avatar.png",
    alt: "VeePN VPN"
  },
}

const nodeToSponsor = node => (customLinks[node.account.slug] || {
  url: node.account.socialLinks.find(link => link.type === "WEBSITE")?.url || node.account.website,
  img: node.account.imageUrl,
  alt: node.account.name
});

function monthDiff(dateFrom, dateTo) {
  return dateTo.getMonth() - dateFrom.getMonth() + (12 * (dateTo.getFullYear() - dateFrom.getFullYear()));
}

const NOW = new Date();
const AMOUNT_PER_MONTH = 100;

const main = async () => {
  console.log(`fetching sponsors from the graphql API`);

  const result = await request({
    method: 'POST',
    uri: graphqlEndpoint,
    body: { query: graphqlQuery },
    json: true
  });

  const sponsors = result.data.account.members.nodes;
  const orders = result.data.account.orders.nodes;

  const activeSponsorsById = new Set();

  orders.forEach(order => {
    const isActiveSubscription = order.status === "ACTIVE";
    const isSufficientOneShotPayment = order.totalAmount.value / (monthDiff(new Date(order.processedAt), NOW) || 1) >= AMOUNT_PER_MONTH;

    if (isActiveSubscription || isSufficientOneShotPayment) {
      activeSponsorsById.add(order.fromAccount.id);
    }
  });

  const activeSponsors = sponsors
    .map(n => {
      const customImage = customImages.get(n.account.slug);
      if (customImage) {
        if (customImage.img) {
          n.account.imageUrl = customImage.img;
        }
        if (customImage.url) {
          n.account.website = customImage.url;
        }
        if (customImage.alt) {
          n.account.name = customImage.alt;
        }
      }
      return n;
    })
    .filter(n => {
      const isSponsor = !n.tier || n.tier.name.toLowerCase() === 'sponsors';
      const isActive = activeSponsorsById.delete(n.account.id); // prevent duplicates
      const hasWebsite = n.account.socialLinks.some(link => link.type === "WEBSITE") || n.account.website; // website attribute is deprecated but still used in some cases

      return isSponsor && isActive && hasWebsite;
    })
    .sort((a, b) => {
      const sortByDonation = b.totalDonations.value - a.totalDonations.value;
      if (Math.abs(sortByDonation) > AMOUNT_PER_MONTH) {
        return sortByDonation;
      }
      return a.createdAt.localeCompare(b.createdAt);
    })
    .map(nodeToSponsor);

  console.log(`${activeSponsors.length} active sponsors out of ${sponsors.length}`);

  fs.writeFileSync(absoluteFilename, JSON.stringify(activeSponsors, null, 2));
  console.log(`content written to ${absoluteFilename}`);
}

main();
