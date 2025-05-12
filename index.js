const fs = require('fs/promises');
const https = require('https');

async function loadConfig(filename) {
  const data = await fs.readFile(filename, 'utf8');
  return JSON.parse(data);
}

async function getDataFromApi(query, apiKey) {
  const url = new URL(`https://newsapi.org/v2/top-headlines?q=${encodeURIComponent(query)}&apiKey=${apiKey}&language=en`);

  const options = {
    method: 'GET',
    headers: {
      'User-Agent': 'Node.js client',
      'Accept': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(url, options, res => {
      let rawData = '';
      res.on('data', chunk => rawData += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(rawData));
        } else {
          reject(`❌ Помилка API: ${res.statusCode}`);
        }
      });
    });

    req.on('error', err => reject("❌ HTTP помилка: " + err.message));
    req.end();
  });
}

async function main() {
  const config = await loadConfig('config.json');
  const query = 'Ukraine';

  try {
    const response = await getDataFromApi(query, config.api_key);
    const articles = response.articles.slice(0, 5);
    articles.forEach((article, index) => {
      console.log(`\n#${index + 1}`);
      console.log("Заголовок:", article.title);
    });
  } catch (err) {
    console.error(err);
  }
}

main();
