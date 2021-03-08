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
    members(role: BACKER, limit: 500) {
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

const customLinks = {
  airtract: {
    url: "https://www.airtract.com",
    img: "/images/sponsors/airtract.jpg",
    alt: "AirTract"
  },
  truevendor: {
    url: "https://www.ramotion.com/agency/ui-ux-design",
    img: "https://images.opencollective.com/truevendor/ddf2f01/logo.png",
    alt: "ui ux design agency"
  },
  pinkelephant: {
    url: "https://akasse-fagforening.dk/",
    img: "/images/sponsors/a-kasse.png",
    alt: "a-kasse"
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
  "buy-fineproxy-org": {
    url: "https://buy.fineproxy.org/eng/",
    img: "/images/sponsors/fineproxy.png",
    alt: "Buy.Fineproxy.Org"
  },
  "nettikasinot-suomalaisille": {
    url: "https://www.nettikasinotsuomalaisille.com/nettikasinot-ilman-rekisteroitymista/",
    img: "/images/sponsors/netti.png",
    alt: "Nettikasinot Suomalaisille"
  },
  "neue-online-casinos1": {
    url: "https://www.neueonline-casinos.com/",
    img: "/images/sponsors/neue.png",
    alt: "Neue Online Casinos"
  },
  "aandelen-kopen1": {
    url: "https://www.aandelenkopen.com",
    img: "/images/sponsors/aandelenkopen.png",
    alt: "Aandelen Kopen"
  },
  vpsservercom: {
    "url": "https://www.vpsserver.com",
    "img": "https://images.opencollective.com/vpsservercom/logo.png",
    "alt": "VPS Hosting"
  },
  topvpnservice: {
    "url": "https://www.topvpnservice.com/",
    "img": "/images/sponsors/topvpnservice.png",
    "alt": "TopVPNService"
  },
  "followerspromotion-com": {
    url: "https://followerspromotion.com/buy-instagram-likes/",
    img: "/images/sponsors/followerspromotion.svg",
    alt: "followers promotions"
  },
  "online-value-group1": {
    url: "https://deutschercasinobonus.com/casino-ohne-deutsche-lizenz/",
    img: "/images/sponsors/deutschercasinobonus.jpg",
    alt: "Deutschercasinobonus.com"
  },
  "quickbooks-tool-hub": {
    url: "https://quickbookstoolhub.com/",
    img: "/images/sponsors/quickbookstoolhub.png",
    alt: "Quickbooks Tool Hub"
  },
  "friendlylikes": {
    url: "https://friendlylikes.com/buy-instagram-likes/",
    img: "https://images.opencollective.com/friendlylikes/fdf1b44/avatar.png",
    alt: "Friendlylikes"
  }
}

const nodeToSponsor = node => (customLinks[node.account.slug] || {
  url: node.account.website,
  img: node.account.imageUrl,
  alt: node.account.name
});

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
    .filter(n => {
      const isSponsor = (!n.tier || n.tier.name === 'sponsors') && n.totalDonations.value >= 100;
      const isActive = activeMembers.has(n.account.slug);
      const hasWebsite = n.account.website;

      return isSponsor && isActive && hasWebsite && unique.delete(n.account.slug);
    })
    .sort((a, b) => {
      const sortByDonation = b.totalDonations.value - a.totalDonations.value;
      if (sortByDonation !== 0) {
        return sortByDonation;
      }
      return a.createdAt.localeCompare(b.createdAt);
    })
    .map(nodeToSponsor);

  fs.writeFileSync(absoluteFilename, JSON.stringify(activeSponsors, null, 2));
  console.log(`content written to ${absoluteFilename}`);
}

main();
