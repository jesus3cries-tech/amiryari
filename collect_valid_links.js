// ============================================
// 📊 STEP 9: Collect Valid Links
// ============================================

const items = $input.all();
const validLinks = [];

for (const item of items) {
  const data = item.json;

  if (data.foundLink && data.foundTitle) {
    validLinks.push({
      title: data.foundTitle,
      link: data.foundLink,
      snippet: data.foundSnippet,
      originalClaim: data.claim,
      // Fix: Use 'keyword' from input, fallback to 'keywords_fa' or empty string
      keywords: data.keyword || data.keywords_fa || '',
      section: data.section,
      sourceType: data.sourceType,
      domainScore: data.domainScore
    });
  }
}

return {
  json: {
    validLinks: validLinks,
    count: validLinks.length
  }
};
