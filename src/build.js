const fs = require("fs");
const path = require("path");

const articlesDir = path.join(__dirname, "..", "articles");
const outputDir = path.join(__dirname, "..", "public");

const siteTitle = "رؤى المعرفة";
const siteDesc = "مدونة عربية متجددة تنشر مقالات مفيدة في مختلف المجالات";

function formatDate(d) {
  const parts = d.split("-");
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function parseContent(content) {
  const titleMatch = content.match(/العنوان:\s*(.+)/);
  const introMatch = content.match(/المقدمة:\s*(.+?)(?:\n##|\nالخاتمة|$)/s);
  const conclusionMatch = content.match(/الخاتمة:\s*(.+)/s);

  const title = titleMatch ? titleMatch[1].trim() : "مقال جديد";

  const body = content
    .replace(/العنوان:\s*.+(\n|$)/, "")
    .replace(/المقدمة:\s*/, "")
    .replace(/الخاتمة:\s*.+/s, "")
    .trim();

  const intro = introMatch ? introMatch[1].trim().replace(/\n+/g, " ") : "";
  const conclusion = conclusionMatch ? conclusionMatch[1].trim() : "";

  return { title, intro, body, conclusion };
}

function renderArticlePage(article) {
  const parsed = parseContent(article.content);
  const date = formatDate(article.date);
  const bodyHtml = parsed.body
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => {
      if (l.startsWith("## ")) {
        return `<h2>${l.replace("## ", "")}</h2>`;
      }
      return `<p>${l}</p>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${parsed.title} - ${siteTitle}</title>
  <meta name="description" content="${parsed.intro.substring(0, 160)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Tajawal',sans-serif;background:#f8f9fa;color:#333;line-height:1.8}
    .container{max-width:800px;margin:0 auto;padding:0 20px}
    header{background:linear-gradient(135deg,#1a237e,#283593);color:#fff;padding:40px 0;text-align:center;margin-bottom:40px}
    header h1{font-size:2rem;margin-bottom:8px}
    header p{color:#c5cae9;font-size:1rem}
    .article-card{background:#fff;border-radius:12px;padding:40px;box-shadow:0 2px 12px rgba(0,0,0,.08);margin-bottom:30px}
    .article-card h1{font-size:1.8rem;color:#1a237e;margin-bottom:10px;line-height:1.4}
    .article-card .date{color:#888;font-size:.9rem;margin-bottom:20px;display:block}
    .article-card h2{color:#283593;font-size:1.3rem;margin:25px 0 10px;padding-right:10px;border-right:3px solid #1a237e}
    .article-card p{margin-bottom:15px;font-size:1.05rem;text-align:justify}
    .article-card .intro{font-size:1.1rem;color:#555;background:#e8eaf6;padding:15px 20px;border-radius:8px;margin-bottom:20px}
    .article-card .conclusion{background:#e8f5e9;padding:15px 20px;border-radius:8px;margin-top:20px;font-weight:500}
    .back-link{display:inline-block;margin-bottom:20px;color:#1a237e;text-decoration:none;font-weight:500}
    .back-link:hover{text-decoration:underline}
    .ad-placeholder{background:#f0f0f0;text-align:center;padding:60px 20px;margin:30px 0;border-radius:8px;color:#999;font-size:.9rem;border:1px dashed #ddd}
    footer{text-align:center;padding:30px 0;color:#888;font-size:.9rem}
    @media(max-width:600px){.article-card{padding:20px}.article-card h1{font-size:1.3rem}}
  </style>
</head>
<body>
  <header>
    <div class="container">
      <h1><a href="/" style="color:#fff;text-decoration:none">${siteTitle}</a></h1>
      <p>${siteDesc}</p>
    </div>
  </header>
  <div class="container">
    <a href="/" class="back-link">← العودة إلى الرئيسية</a>
    <article class="article-card">
      <h1>${parsed.title}</h1>
      <span class="date">📅 ${date}</span>
      <div class="intro">${parsed.intro}</div>
      ${bodyHtml}
      ${parsed.conclusion ? `<div class="conclusion">${parsed.conclusion}</div>` : ""}
    </article>
    <div class="ad-placeholder">📢 إعلان Google AdSense (أضف رمز الإعلان هنا لاحقاً)</div>
  </div>
  <footer>
    <div class="container">
      <p>${siteTitle} &copy; ${new Date().getFullYear()} | جميع الحقوق محفوظة</p>
    </div>
  </footer>
</body>
</html>`;
}

function renderIndexPage(articles) {
  const items = articles
    .map(
      (a) => `
    <a href="/${a.slug}" class="post-card">
      <h2>${a.title}</h2>
      <span class="date">📅 ${formatDate(a.date)}</span>
      <p>${a.excerpt}</p>
      <span class="read-more">اقرأ المزيد ←</span>
    </a>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${siteTitle}</title>
  <meta name="description" content="${siteDesc}">
  <meta name="google-adsense-account" content="ca-pub-xxxxxxxxxxxxxxxx">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Tajawal',sans-serif;background:#f8f9fa;color:#333;line-height:1.8}
    .container{max-width:800px;margin:0 auto;padding:0 20px}
    header{background:linear-gradient(135deg,#1a237e,#283593);color:#fff;padding:60px 0 50px;text-align:center}
    header h1{font-size:2.5rem;margin-bottom:10px}
    header p{color:#c5cae9;font-size:1.1rem}
    .post-card{display:block;background:#fff;border-radius:12px;padding:25px 30px;margin:20px 0;box-shadow:0 2px 12px rgba(0,0,0,.06);text-decoration:none;color:#333;transition:transform .2s,box-shadow .2s}
    .post-card:hover{transform:translateY(-2px);box-shadow:0 4px 20px rgba(0,0,0,.1)}
    .post-card h2{color:#1a237e;font-size:1.3rem;margin-bottom:8px}
    .post-card .date{color:#888;font-size:.85rem}
    .post-card p{color:#555;margin:10px 0;font-size:.95rem}
    .read-more{color:#1a237e;font-weight:500;font-size:.9rem}
    .ad-placeholder{background:#f0f0f0;text-align:center;padding:60px 20px;margin:30px 0;border-radius:8px;color:#999;font-size:.9rem;border:1px dashed #ddd}
    .stats{text-align:center;color:#888;margin:20px 0;font-size:.9rem}
    footer{text-align:center;padding:30px 0;color:#888;font-size:.9rem;margin-top:40px}
    @media(max-width:600px){header h1{font-size:1.8rem}.post-card{padding:20px}}
  </style>
</head>
<body>
  <header>
    <div class="container">
      <h1>${siteTitle}</h1>
      <p>${siteDesc}</p>
    </div>
  </header>
  <div class="container">
    <div class="stats">📚 ${articles.length} مقال منشور</div>
    ${items}
    <div class="ad-placeholder">📢 إعلان Google AdSense (أضف رمز الإعلان هنا لاحقاً)</div>
  </div>
  <footer>
    <div class="container">
      <p>${siteTitle} &copy; ${new Date().getFullYear()} | جميع الحقوق محفوظة</p>
    </div>
  </footer>
</body>
</html>`;
}

function build() {
  if (!fs.existsSync(articlesDir)) {
    fs.mkdirSync(articlesDir, { recursive: true });
  }
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const files = fs
    .readdirSync(articlesDir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .reverse();

  const articles = files.map((f) => {
    const data = JSON.parse(fs.readFileSync(path.join(articlesDir, f), "utf-8"));
    const parsed = parseContent(data.content);
    return {
      title: parsed.title,
      date: data.date,
      slug: data.slug,
      excerpt: parsed.intro.substring(0, 120) + "...",
    };
  });

  // Build index
  fs.writeFileSync(path.join(outputDir, "index.html"), renderIndexPage(articles), "utf-8");

  // Build article pages
  files.forEach((f) => {
    const data = JSON.parse(fs.readFileSync(path.join(articlesDir, f), "utf-8"));
    fs.writeFileSync(path.join(outputDir, `${data.slug}.html`), renderArticlePage(data), "utf-8");
  });

  console.log(`✅ تم بناء الموقع: ${articles.length} مقال`);
}

build();
