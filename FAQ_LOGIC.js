// 1. INPUT EXTRACTION
// We extract the content from the previous node
const inputItem = $input.first();
const json = inputItem.json;

// Robust extraction for both nested API response and flattened n8n keys
let fullContent = "";
if (json["choices[0].message.content"]) {
    fullContent = json["choices[0].message.content"];
} else if (json.choices?.[0]?.message?.content) {
    fullContent = json.choices[0].message.content;
} else if (json.content) {
    fullContent = json.content; // Fallback for simple structure
} else {
    fullContent = "";
}

// 2. CONTENT PROCESSING
// Extract Title (H1 or H2)
const titleMatch = fullContent.match(/^#{1,2}\s+(.+)/m);
const articleTitle = titleMatch ? titleMatch[1].trim() : (json.originalTitle || "موضوع مقاله");

// Extract First 300 Words for Context (User Requirement)
// We remove the title line to avoid repetition, then take the first 300 words.
let textBody = fullContent;
if (titleMatch) {
    // Remove the title line from the body text to get clean content
    textBody = fullContent.replace(titleMatch[0], "").trim();
}

// Normalize whitespace and split by words
const words = textBody.split(/\s+/);
const contextPreview = words.slice(0, 300).join(" ");

// 3. PROMPT CONSTRUCTION
const systemPrompt = `تو یک نویسنده حرفه‌ای محتوای فارسی هستی که تخصص در تولید بخش سوالات متداول (FAQ) جامع برای مقالات درباره عسل و محصولات طبیعی داری.

🎯 **وظایف:**
1. استخراج دقیقاً ۴ تا ۶ سوال متداول (نه کمتر، نه بیشتر) که خوانندگان ممکن است بپرسند
2. ارائه پاسخ‌های واضح، مختصر و عملی (۵۰-۱۰۰ کلمه هر پاسخ)
3. استفاده از زبان ساده و لحن گفتگویی

⚠️ **قوانین سخت‌گیرانه:**
- خروجی فقط Markdown
- تعداد سوالات باید بین ۴ تا ۶ مورد باشد
- بدون لینک
- لحن صمیمی اما حرفه‌ای
- سوالات باید طبیعی و جستجوگر باشند
- پاسخ‌ها باید مستقیم و قابل اقدام باشند
- شامل ۱-۲ مثال مرتبط در پاسخ‌ها`;

const userPrompt = `Analyze the following Persian article and create a comprehensive FAQ section.

ARTICLE TOPIC: ${articleTitle}

ARTICLE CONTENT (Context):
"${contextPreview}..."
---

INSTRUCTIONS:
1. Extract EXACTLY 4 to 6 most common questions readers would ask about this topic.
2. DO NOT generate fewer than 4 or more than 6 questions.
3. Provide clear, concise answers (50-100 words each).
4. Use simple language and conversational tone.
5. Include diverse question types:
   - "چیست" (What is)
   - "چگونه" (How to)
   - "چرا" (Why)
   - "چه زمانی" (When)
   - Comparison questions
   - Troubleshooting questions

OUTPUT FORMAT:
Use this exact Markdown structure in Persian:

## سوالات متداول (FAQ)

### ❓ [Question 1]
[Answer in 50-100 words]

### ❓ [Question 2]
[Answer in 50-100 words]

[Continue for 4-6 questions...]

REQUIREMENTS:
- Write entirely in Persian
- Use emoji ❓ before each question
- Make questions sound natural (how people actually search)
- Answers must be direct and actionable
- Include 1-2 relevant examples in answers`;

// 4. OUTPUT
return [{
  json: {
    originalTitle: articleTitle,
    requestBody: {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 1200,
      temperature: 0.7
    }
  }
}];
