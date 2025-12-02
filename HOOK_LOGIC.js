// 1. INPUT EXTRACTION
// We extract the content from the previous node
const inputItem = $input.first();
const fullContent = inputItem.json.choices?.[0]?.message?.content || "";

// Extract Title
// Regex: Matches # or ## at start of line followed by text
const titleMatch = fullContent.match(/^#{1,2}\s+(.+)/m);
const articleTitle = titleMatch ? titleMatch[1].trim() : "موضوع مقاله";

// Extract Current Intro
// Strategy:
// 1. Check for explicit "مقدمه" (Introduction) section.
// 2. Fallback: Extract text immediately following the detected Title up to the next Header.
let currentIntro = "";

const explicitIntroMatch = fullContent.match(/##\s+مقدمه\s+([\s\S]*?)(?=##|$)/);

if (explicitIntroMatch) {
  currentIntro = explicitIntroMatch[1].trim();
} else if (titleMatch) {
  // Fallback: Get text after the title line
  const contentAfterTitle = fullContent.substring(titleMatch.index + titleMatch[0].length);

  // Find the next header (start of line followed by #)
  const nextHeaderMatch = contentAfterTitle.match(/\n#+\s/);

  if (nextHeaderMatch) {
    currentIntro = contentAfterTitle.substring(0, nextHeaderMatch.index).trim();
  } else {
    // No subsequent headers, assume remainder is intro
    currentIntro = contentAfterTitle.trim();
  }
}

// 2. RANDOMIZATION CONFIGURATION (Prompt Mixer)
const hookTypes = [
  {
    id: "misconception",
    name: "The Myth Buster",
    instruction: "Identify a common misconception or 'lie' people believe about this topic. Start by debunking it. 'Most people think X, but actually Y...'.",
    persian_hint: "باور غلط را به چالش بکشید"
  },
  {
    id: "story",
    name: "The Micro-Story",
    instruction: "Start with a short, relatable anecdotal scenario. 'Imagine you are...' or 'It happened yesterday...'. Put the reader in the scene immediately.",
    persian_hint: "یک داستان کوتاه یا تصویرسازی ذهنی"
  },
  {
    id: "statistic",
    name: "The Shocking Stat",
    instruction: "Cite a specific, surprising statistic or number (can be generalized if exact data is unknown, e.g., 'Over 80% of users...'). Use the number in the very first sentence.",
    persian_hint: "آمار شوکه‌کننده"
  },
  {
    id: "question",
    name: "The Provocative Question",
    instruction: "Ask a deep, rhetorical question that touches on the reader's hidden fear or desire. Not a simple 'Yes/No' question, but one that makes them stop scrolling.",
    persian_hint: "سوال تفکربرانگیز"
  },
  {
    id: "fear_missing_out",
    name: "The FOMO/Secret",
    instruction: "Imply there is a secret, hidden method, or 'unspoken rule' that others are using to succeed. 'The top 1% know this...'.",
    persian_hint: "راز مخفی یا ترس از دست دادن"
  },
  {
    id: "diagnosis",
    name: "The Diagnosis",
    instruction: "Describe a specific symptom or feeling the reader has. 'If you often feel tired after lunch, read this...'. Validate their pain.",
    persian_hint: "تشخیص درد یا مشکل مخاطب"
  }
];

const toneTypes = [
  {
    id: "empathetic",
    name: "Empathetic & Understanding",
    instruction: "Use a warm, supportive tone. Use words like 'understand', 'feel', 'together'. Treat the reader like a close friend."
  },
  {
    id: "authoritative",
    name: "Authoritative & Direct",
    instruction: "Be confident, firm, and expert-like. No fluff. Get straight to the point. Act like a senior mentor."
  },
  {
    id: "energetic",
    name: "High Energy & Enthusiastic",
    instruction: "Use energetic verbs and convey genuine excitement about the solution. Make the reader feel pumped up."
  },
  {
    id: "curious",
    name: "Mysterious & Intriguing",
    instruction: "Hold back some information to build suspense. Use an open loop. Make them crave the answer."
  }
];

// Pick random combination
const selectedHook = hookTypes[Math.floor(Math.random() * hookTypes.length)];
const selectedTone = toneTypes[Math.floor(Math.random() * toneTypes.length)];

// 3. PROMPT CONSTRUCTION
const systemPrompt = `You are an expert Persian Content Strategist and Copywriter.
Your task is to write a high-conversion introduction (Hook) for a blog post.
You must strictly follow the defined 'Hook Strategy' and 'Tone'.
Language: Persian (Farsi).
Output Format: Plain text (Markdown allowed for bolding).`;

const userPrompt = `
**TASK:** Rewrite the introduction for the following article to make it viral and engaging.

**METADATA:**
- **Topic:** ${articleTitle}
- **Draft Content (Context):** ${currentIntro.substring(0, 500)}...

**REQUIRED STYLE:**
- **Hook Strategy:** ${selectedHook.name}
  - *Instruction:* ${selectedHook.instruction}
- **Tone:** ${selectedTone.name}
  - *Instruction:* ${selectedTone.instruction}

**STRUCTURE:**
1. **The Hook (First 2 sentences):** Execute the '${selectedHook.name}' strategy perfectly. Grab attention instantly.
2. **The Problem/Bridge:** Agitate the problem or bridge the hook to the main topic.
3. **The Value Proposition:** Use bullet points (✅) to list 3 distinct things the reader will learn.
4. **The Transition:** A compelling final sentence urging them to read on.

**CONSTRAINTS:**
- Write in natural, conversational Persian (avoid stiff 'ketabi' language).
- Total length: 150-200 words.
- Use **Bold** for the most impactful phrase in the hook.
- Include 1 or 2 relevant emojis.
- Do NOT label the sections. Just write the flowing text.

**Generate the output now:**
`;

// 4. OUTPUT
return [{
  json: {
    originalTitle: articleTitle,
    generatedParams: {
      strategy: selectedHook.name,
      tone: selectedTone.name
    },
    requestBody: {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt }
      ],
      max_tokens: 800,
      temperature: 0.85
    }
  }
}];
