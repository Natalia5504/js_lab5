const fs = require('fs/promises');

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

async function main() {
  const config = await loadConfig('config.json');
  console.log("🔑 Ваш API-ключ:", config.api_key);
}

main();
