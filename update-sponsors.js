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
          imageUrl
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
  ["alessandro-rivieccio", { url: "https://www.casinosansdepot.com", img: "/images/sponsors/casinosansdepot.png", alt: "casinosansdepot" }],
  ["casinoalpha", { url: "https://casinoalpha.com/", img: "/images/sponsors/casinoalpha.png", alt: "CasinoAlpha" }],
  ["casinobonusca", { url: "https://casinobonusca.com/", img: "/images/sponsors/casinobonusca.png", alt: "CasinoBonusCa" }],
  ["king10", { url: "https://kingcasinobonus.co.uk", img: "/images/sponsors/king10.png", alt: "KingCasinoBonus" }],
  ["gem-m", { url: "https://www.noneedtostudy.com/take-my-online-class/", img: "/images/sponsors/noneedtostudy.png", alt: "Pay someone to take my online class - NoNeedToStudy.com" }],
  ["yana1", { url: "https://nongamstopcasinos.net/", img: "/images/sponsors/nongamstopcasinos.png", alt: "Non Gamstop Casinos" }],
  ["de2", { url: "https://www.slotozilla.com/de/software/novoline-de", img: "/images/sponsors/slotozilla.png", alt: "Novoline Spielautomaten" }],
]);

const customLinks = {
  "veselin-lalev": {
    url: "https://casinodaddy.com",
    img: "/images/sponsors/casinodaddy.png",
    alt: "Casino Daddy"
  },
  papersowl2: {
    url: "https://papersowl.com/research-papers",
    img: "https://images.opencollective.com/papersowl2/510de59/logo.png",
    alt: "Papersowl"
  },
  "neue-online-casinos1": {
    url: "https://www.neueonline-casinos.com/",
    img: "/images/sponsors/neue.png",
    alt: "Neue Online Casinos"
  },
  "quickbooks-tool-hub": {
    url: "https://quickbookstoolhub.com/",
    img: "/images/sponsors/quickbookstoolhub.png",
    alt: "Quickbooks Tool Hub"
  },
  "red-dog": {
    url: "https://reddogcasino.com/en/games/blackjack",
    img: "https://images.opencollective.com/red-dog/49e9d6f/logo.png",
    alt: "RedDogCasino.com"
  },
  "leafletcasino-com": {
    url: "https://leafletcasino.com/",
    img: "https://images.opencollective.com/leafletcasino-com/f8cd951/logo.png",
    alt: "leafletcasino.com"
  },
  "casinotest-ltd": {
    url: "https://www.casinotest.com/",
    img: "https://images.opencollective.com/casinotest-ltd/7e3c899/logo.png",
    alt: "CasinoTest Ltd."
  },
  "automatenspielexcom": {
    url: "https://automatenspielex.com/online-casinos",
    img: "/images/sponsors/automatenspielexcom.png",
    alt: "beste online casino deutschland"
  },
  "ncsquare": {
    url: "https://kiwigambler.co.nz/online-casinos/online-pokies/free-spins-no-deposit",
    img: "/images/sponsors/ncsquare.png",
    alt: "Kiwi Gambler NZ"
  },
  "veepn-vpn": {
    url: "https://veepn.com/vpn-apps/download-vpn-for-pc/",
    img: "https://images.opencollective.com/veepn-vpn/5e3715a/avatar.png",
    alt: "VeePN VPN"
  },
  "noverificationcasino": {
    url: "https://no-verification.casino/canada/",
    img: "https://images.opencollective.com/noverificationcasino/6e11a64/logo.png",
    alt: "online casino no verification withdrawal canada"
  },
  andynichols: {
    url: "https://hmkasinotsuomi.com",
    img: "/images/sponsors/holymolycasinos.png",
    alt: "Suomalaiset kasinot"
  }
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
