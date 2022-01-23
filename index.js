const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const env = require("dotenv");

env.config();

const PORT = process.env.PORT || 3909;

const app = express();

const genesiss = [
  {
    name: "The New York Times",
    address: "https://www.nytimes.com/news-event/coronavirus",
    base: "https://www.nytimes.com",
  },
  {
    name: "The Wall Street Journal",
    address: "https://www.wsj.com/news/coronavirus",
    base: "https://www.wsj.com",
  },
  {
    name: "The Washington Post",
    address: "https://www.washingtonpost.com/coronavirus",
    base: "https://www.washingtonpost.com",
  },
  { name: "The Economist", address: "https://www.economist.com/", base: "" },
  { name: "The NewYorker", address: "https://www.newyorker.com/", base: "" },
  { name: "Reuters", address: "https://www.reuters.com/", base: "" },
  { name: "Bloomberg", address: "https://www.bloomberg.com/africa", base: "" },
  { name: "Associated press", address: "https://www.apnews.com/", base: "" },
  {
    name: "The Atlantic",
    address: "https://www.theatlantic.com/world/",
    base: "",
  },
  { name: "The Politico", address: "https://www.politico.com/", base: "" },
];

const info = [];

genesiss.forEach((genesis) => {
  axios.get(genesis.address).then((response) => {
    const html = response.data;
    const $ = cheerio.load(html);

    $('a:contains("covid")', html).each(function () {
      const title = $(this).text();
      const url = $(this).attr("href");

      info.push({
        title,
        url: genesis.base + url,
        source: genesis.name,
      });
    });
  });
});

app.get("/", (req, res) => {
  res.json("welcome to my Covid News API");
});

app.get("/news", (req, res) => {
  res.json(info);
});

app.get("/news/:genesisId", async (req, res) => {
  const genesisId = req.params.genesisId;
  const genesisAddress = genesiss.filter(
    (genesis) => genesis.name == genesisId
  )[0].address;
  const genesisBase = genesiss.filter((genesis) => genesis.name == genesisId)[0]
    .base;

  axios
    .get(genesisAddress)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      const specificInfo = [];

      $('a:contains("covid")', html).each(function () {
        const title = $(this).text();
        const url = $(this).attr("href");
        specificInfo.push({
          title,
          url: genesisBase + url,
          source: genesisId,
        });
      });
      res.json(specificInfo);
    })
    .catch((err) => console.log(err));
});

app.listen(PORT, () => console.log(`server is running on Port ${PORT}`));
