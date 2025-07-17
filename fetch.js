const fs = require("fs");
const https = require("https");
require("dotenv").config();

const GITHUB_TOKEN = process.env.REACT_APP_GITHUB_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const USE_GITHUB_DATA = process.env.USE_GITHUB_DATA;

const ERR = {
  noUserName:
    "Github Username was found to be undefined. Please set all relevant environment variables.",
  requestFailed:
    "The request to GitHub didn't succeed. Check if GitHub token in your .env file is correct.",
};

if (USE_GITHUB_DATA === "true") {
  if (!GITHUB_USERNAME) {
    throw new Error(ERR.noUserName);
  }

  console.log(`📦 Fetching GitHub data for ${GITHUB_USERNAME}`);

  const data = JSON.stringify({
    query: `
{
  user(login:"${GITHUB_USERNAME}") { 
    name
    bio
    avatarUrl
    location
    pinnedItems(first: 6, types: [REPOSITORY]) {
      totalCount
      edges {
          node {
            ... on Repository {
              name
              description
              forkCount
              stargazers {
                totalCount
              }
              url
              id
              diskUsage
              primaryLanguage {
                name
                color
              }
            }
          }
        }
      }
    }
}
`
  });

  const githubOptions = {
    hostname: "api.github.com",
    path: "/graphql",
    port: 443,
    method: "POST",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "User-Agent": "Node"
    }
  };

  const req = https.request(githubOptions, (res) => {
    let dataBuffer = "";

    console.log(`✅ GitHub API statusCode: ${res.statusCode}`);
    if (res.statusCode !== 200) {
      throw new Error(ERR.requestFailed);
    }

    res.on("data", (chunk) => {
      dataBuffer += chunk;
    });

    res.on("end", () => {
      fs.writeFile("./public/profile.json", dataBuffer, (err) => {
        if (err) return console.log(err);
        console.log("✅ Saved GitHub data to public/profile.json");
      });
    });
  });

  req.on("error", (error) => {
    throw error;
  });

  req.write(data);
  req.end();
}

// 🚫 Skipping Medium blog fetch entirely
console.log("📰 Skipping Medium blog fetch (disabled).");
