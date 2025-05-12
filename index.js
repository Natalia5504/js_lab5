const fs = require('fs/promises');
const https = require('https');

async function loadConfig(filename) {
  try {
    const data = await fs.readFile(filename, 'utf8');
    const config = JSON.parse(data);
    return config;
  } catch (error) {
    console.error("❌ Помилка завантаження конфігурації:", error.message);
    process.exit(1);
  }
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

      res.on('data', chunk => {
        rawData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(rawData);
            resolve(parsed);
          } catch (e) {
            reject("❌ Помилка розбору JSON");
          }
        } else {
          reject(`❌ Помилка API: ${res.statusCode}\n${rawData}`);
        }
      });
    });

    req.on('error', err => {
      reject("❌ HTTP помилка: " + err.message);
    });

    req.end();
  });
}

async function main() {
  console.log("🚀 Запуск програми...");

  const config = await loadConfig('config.json');
  const query = 'Ukraine';

  try {
    const response = await getDataFromApi(query, config.api_key);
    console.log("✅ Дані з API отримано!");

    const articles = response.articles.slice(0, 5);
    articles.forEach((article, index) => {
      console.log(`\n#${index + 1}`);
      console.log("Заголовок:", article.title);
      console.log("Дата:", article.publishedAt);
      console.log("Опис:", article.description);
    });

    await fs.writeFile('output.json', JSON.stringify(response, null, 2));
    console.log('\n💾 Результат збережено у "output.json"');
  } catch (err) {
    console.error(err);
  }
}

main();
