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
    // Fail fast if content is missing
    throw new Error('❌ No article content found in input');
}

// 2. CONTENT PROCESSING
// Extract Title (H1 or H2)
const titleMatch = fullContent.match(/^#{1,2}\s+(.+)/m);
const articleTitle = titleMatch ? titleMatch[1].trim() : (json.originalTitle || "عنوان مشخص نشده");

// Extract Main Points (H2 headings) for the Recap
const headings = [...fullContent.matchAll(/##\s+(.+)/g)].map(m => m[1].trim());
const mainPoints = headings.length > 0
  ? headings.slice(0, 5).map((h, i) => `${i + 1}. ${h}`).join('\n')
  : "نکات اصلی مقاله"; // Fallback if no subheaders found

// Extract First 300 Words for Context (User Requirement)
let textBody = fullContent;
if (titleMatch) {
    // Remove the title line from the body text
    textBody = fullContent.replace(titleMatch[0], "").trim();
}
// Normalize whitespace and split by words
const words = textBody.split(/\s+/);
const contextPreview = words.slice(0, 300).join(" ");


// 3. PROMPT CONSTRUCTION
const systemPrompt = `You are a conversion copywriter specializing in creating powerful conclusions and calls‑to‑action for Persian content.
Your expertise is in motivating readers to take action while maintaining a friendly, encouraging tone.`;

const userPrompt = `
Create a powerful conclusion with an engaging Call‑to‑Action for this Persian article.

ARTICLE TOPIC: ${articleTitle}

MAIN POINTS (Headings):
${mainPoints}

CONTEXT (First ~300 words):
"${contextPreview}..."

---

INSTRUCTIONS:
Write a conclusion (150‑200 words) with this structure:

**PART 1: QUICK RECAP (50‑70 words)**
Summarize key takeaways in bullet points based on the Main Points and Context:
- "✅ [نکته اول]"
- "✅ [نکته دوم]"
- "✅ [نکته سوم]"
Use 3‑5 bullets maximum.

**PART 2: EMPOWERMENT MESSAGE (30‑50 words)**
Boost reader confidence:
- Acknowledge the journey: "حالا که این اطلاعات را دارید..."
- Reinforce capability: "شما می‌توانید..."
- Create urgency (if appropriate): "بهترین زمان برای شروع همین الان است"

**PART 3: CLEAR CALL‑TO‑ACTION (40‑60 words)**
Include ONE primary action (choose the most relevant):
1. **Comment/Engagement**: "تجربه شما چیست؟ در کامنت‌ها بنویسید..."
2. **Share**: "این مطلب را با دوستانتان به اشتراک بگذارید..."
3. **Next Step**: "قدم بعدی: [specific action]"
4. **Question**: End with an engaging question to prompt discussion

**PART 4: WARM CLOSING (1 sentence)**
- Friendly sign‑off: "موفق باشید! ✨"

---

OUTPUT REQUIREMENTS:
- Write in Persian/Farsi
- Use encouraging, friendly tone
- Include 2‑3 relevant emojis (✅ 💡 🚀 ⭐ 🎯)
- Total length: 150‑200 words

AVOID:
- Starting with "نتیجه گیری"
- Generic endings like "امیدواریم مفید بود"
- Multiple CTAs (confusing)
- Pushy sales language
`;

// 4. OUTPUT
return [{
  json: {
    originalTitle: articleTitle,
    requestBody: {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt }
      ],
      max_tokens: 600,
      temperature: 0.95
    }
  }
}];
