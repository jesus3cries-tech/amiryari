// --------------------------------------------------------------------
// Combine Hook, Blog, FAQ, and CTA into one Markdown text
// --------------------------------------------------------------------

// 1. Define the order of inputs (Matches your Merge node)
const sectionNames = ['hook', 'blog', 'faq', 'cta'];

// 2. Get all items
const items = $input.all();

// Helper to extract text from different formats (choices vs output vs content)
function extractContent(item) {
  if (!item) return '';
  const json = item.json;

  // Priority 1: Direct 'output' field (Used in your Blog node)
  if (json.output) return json.output;

  // Priority 2: OpenAI 'choices' structure (Used in Hook/FAQ/CTA)
  if (json.choices && json.choices[0] && json.choices[0].message) {
    return json.choices[0].message.content;
  }

  // Priority 3: Direct 'content' field
  if (json.content) return json.content;

  return '';
}

// 3. Process and Combine
let fullMarkdown = "";
const resultData = {};
let mainTitle = null;

sectionNames.forEach((name, index) => {
  const item = items[index];
  let text = extractContent(item);

  if (!text) return;

  // --- CLEANUP LOGIC ---
  // Remove markdown code blocks if present (e.g., ```markdown ... ```)
  // This is critical for the 'blog' section which comes from AI output often wrapped in blocks
  if (text.trim().startsWith('```')) {
      text = text.replace(/^```[a-z]*\s*/i, '') // Remove starting ```markdown or ```
                 .replace(/\s*```$/, '');        // Remove ending ```
  }

  text = text.trim();

  // --- TITLE EXTRACTION LOGIC ---
  // We only look for the title in the 'blog' section (Index 1)
  if (name === 'blog') {
    // Regex to find the first line starting with # or ##
    // Example: "## جدول قیمت عسل..."
    const titleMatch = text.match(/^\s*#{1,2}\s+(.+)/);

    if (titleMatch) {
      // 1. Set the main title
      mainTitle = titleMatch[1].trim();

      // 2. Remove this line from the text so it doesn't duplicate in the final HTML
      text = text.replace(titleMatch[0], '').trim();
    }
  }

  // Store individual part
  resultData[name] = text;

  // Append to full markdown with spacing
  fullMarkdown += text.trim() + "\n\n";
});

// 4. Final Output
return {
  json: {
    // Extracted Title (or fallback)
    title: mainTitle || 'بدون عنوان',

    // Combined Markdown (Cleaned)
    markdown_all: fullMarkdown.trim(),

    // Individual parts for debugging
    ...resultData
  }
};
