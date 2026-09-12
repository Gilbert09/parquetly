// Pings IndexNow so Bing (and Yandex, Seznam, Naver) recrawl promptly.
// IndexNow needs no account: the key file at public/34f9dfae938c42bae2071d9412b56e2a.txt proves ownership.
// Run with: node scripts/indexnow.mjs
const KEY = "34f9dfae938c42bae2071d9412b56e2a";
const HOST = "www.parquetly.com";

const urlList = [
  `https://${HOST}/`,
  `https://${HOST}/parquet-to-csv`,
  `https://${HOST}/parquet-to-json`,
];

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList,
  }),
});

console.log(`IndexNow: HTTP ${res.status} for ${urlList.length} URLs`);
if (!res.ok) {
  console.error(await res.text());
  process.exit(1);
}
