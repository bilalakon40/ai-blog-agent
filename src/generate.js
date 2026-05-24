const fs = require("fs");
const path = require("path");
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const topics = [
  "العناية بالبشرة طبيعياً",
  "وصفات طبخ صحية",
  "تربية الأطفال بإيجابية",
  "الذكاء العاطفي في العمل",
  "تنظيم الوقت بفعالية",
  "مشاريع صغيرة من المنزل",
  "الصحة النفسية والاسترخاء",
  "التسويق عبر وسائل التواصل",
  "تطوير الذات والثقة بالنفس",
  "الربح من الإنترنت بصدق",
  "نصائح للسفر بميزانية محدودة",
  "فوائد الرياضة اليومية",
  "القراءة وتأثيرها على العقل",
  "إدارة الضغوط اليومية",
  "توفير المال ونصائح الادخار",
  "الأكل الصحي للعائلة",
  "الهوايات الإبداعية المربحة",
  "العلاقات الزوجية الناجحة",
  "التعلم الذاتي والمهارات الجديدة",
  "التغلب على التسويف والكسل",
];

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function slugify(text) {
  return text
    .replace(/[^\w\s\u0600-\u06FF]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .substring(0, 80);
}

async function askAI(prompt) {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "أنت كاتب محتوى عربي محترف. اكتب مقالاً طويلاً غني بالمعلومات بأسلوب سلس وجذاب.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

async function generate() {
  console.log("📝 جاري كتابة مقال جديد...");

  const topic = pick(topics);
  const prompt = `اكتب مقالاً متكاملاً بالعربية الفصحى عن: "${topic}"

المطلوب:
- عنوان جذاب
- مقدمة شيقة (3-4 جمل)
- محتوى مفصل (300-500 كلمة) مقسم إلى فقرات بعناوين فرعية
- خاتمة مفيدة
- أسلوب سهل ومباشر ومناسب للقراءة على الإنترنت

التنسيق المطلوب:
العنوان: ...
المقدمة: ...
## [عنوان فرعي 1]
...
## [عنوان فرعي 2]
...
الخاتمة: ...
`;

  const content = await askAI(prompt);
  console.log("✅ تم كتابة المقال بنجاح");

  const titleMatch = content.match(/العنوان:\s*(.+)/);
  const title = titleMatch ? titleMatch[1].trim() : topic;
  const slug = slugify(title);
  const date = new Date().toISOString().split("T")[0];
  const filename = `${date}-${slug}.json`;
  const filepath = path.join(__dirname, "..", "articles", filename);

  const article = {
    title,
    date,
    content,
    slug,
  };

  fs.writeFileSync(filepath, JSON.stringify(article, null, 2), "utf-8");
  console.log(`💾 تم حفظ المقال: articles/${filename}`);
}

generate().catch((err) => {
  console.error("❌ فشل:", err.message);
  process.exit(1);
});
