#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const request = require('request-promise');

const filename = 'sponsors.json';
const absoluteFilename = path.resolve(__dirname, filename);

const graphqlEndpoint = 'https://api.opencollective.com/graphql/v2';

const graphqlQuery = `query account {
  account(slug: "socketio") {
    members(role: BACKER, accountType: ORGANIZATION, limit: 500) {
      nodes {
        id
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

const nodeToSponsor = node => ({
  url: node.account.website,
  img: node.account.imageUrl,
  alt: node.account.name
});

const getAllSponsors = async () => {
  const requestOptions = {
    method: 'POST',
    uri: graphqlEndpoint,
    body: { query: graphqlQuery },
    json: true
  };

  const result = await request(requestOptions);
  return result.data.account.members.nodes;
};

const main = async () => {
  console.log(`fetching sponsors from the graphql API`);
  const nodes = await getAllSponsors();
  console.log(`fetched ${nodes.length} sponsors`);

  const sponsors = nodes
    .filter(n => n.account.website && n.totalDonations.value >= 100)
    .sort((a, b) => {
      const sortByDonation = b.totalDonations.value - a.totalDonations.value;
      if (sortByDonation !== 0) {
        return sortByDonation;
      }
      return a.createdAt.localeCompare(b.createdAt);
    })
    .map(nodeToSponsor);

  fs.writeFileSync(absoluteFilename, JSON.stringify(sponsors, null, 2));
  console.log(`content written to ${absoluteFilename}`);
}

main();
