#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const request = require('request-promise');

const filename = 'sponsors.json';
const absoluteFilename = path.resolve(__dirname, filename);

const membersUrl = 'https://opencollective.com/socketio/members/all.json';

const graphqlEndpoint = 'https://api.opencollective.com/graphql/v2';

const graphqlQuery = `query account {
  account(slug: "socketio") {
    members(role: BACKER, limit: 1000) {
      nodes {
        tier {
          name
        }
        account {
          name
          slug
          website
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
]);

const customLinks = {
  truevendor: {
    url: "https://www.ramotion.com/agency/ui-ux-design",
    img: "https://images.opencollective.com/truevendor/ddf2f01/logo.png",
    alt: "ui ux design agency"
  },
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
  vpsservercom: {
    "url": "https://www.vpsserver.com",
    "img": "https://images.opencollective.com/vpsservercom/logo.png",
    "alt": "VPS Hosting"
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
  "guest-3f7631a8": {
    url: "https://www.testarna.se/casino/utan-svensk-licens/utlandska",
    img: "/images/sponsors/testarna.jpg",
    alt: "Testarna.se"
  },
  "quickbooks-error-codes": {
    url: "https://cfi-blog.org",
    img: "/images/sponsors/cfi-blog.png",
    alt: "CFI-BLOG"
  }
}

const nodeToSponsor = node => (customLinks[node.account.slug] || {
  url: node.account.website,
  img: node.account.imageUrl,
  alt: node.account.name
});

const AMOUNT_PER_MONTH = 100;

const main = async () => {
  console.log(`fetching sponsors from the graphql API`);

  const [ members, sponsors ] = await Promise.all([
    request({
      method: 'GET',
      uri: membersUrl,
      json: true
    }),
    request({
      method: 'POST',
      uri: graphqlEndpoint,
      body: { query: graphqlQuery },
      json: true
    }).then(result => result.data.account.members.nodes)
  ]);

  const activeMembers = new Set();
  members.forEach(member => {
    if (member.isActive && member.profile) {
      const slug = member.profile.substring('https://opencollective.com/'.length);
      activeMembers.add(slug);
    }
  });
  console.log(`${activeMembers.size} active members out of ${members.length}`);

  const unique = new Set(activeMembers);

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
      const isSponsor = (!n.tier || n.tier.name.toLowerCase() === 'sponsors') && n.totalDonations.value >= AMOUNT_PER_MONTH;
      const isActive = activeMembers.has(n.account.slug);
      const hasWebsite = n.account.website;

      return isSponsor && isActive && hasWebsite && unique.delete(n.account.slug);
    })
    .sort((a, b) => {
      const sortByDonation = b.totalDonations.value - a.totalDonations.value;
      if (Math.abs(sortByDonation) > AMOUNT_PER_MONTH) {
        return sortByDonation;
      }
      return a.createdAt.localeCompare(b.createdAt);
    })
    .map(nodeToSponsor);

  fs.writeFileSync(absoluteFilename, JSON.stringify(activeSponsors, null, 2));
  console.log(`content written to ${absoluteFilename}`);
}

main();
