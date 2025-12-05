// ============================================
// 🧹 CLEAN GOOGLE SEARCH RESULTS
// ============================================

const items = $input.all();
const returnData = [];

for (const item of items) {
  const data = item.json;

  // 1. Get Results Array safely
  // Google Custom Search returns 'items'. Serper returns 'organic'.
  const rawResults = data.items || data.body?.items || [];

  // 2. Extract Query (Critical for context matching)
  let query = '';
  if (data.queries && data.queries.request && data.queries.request.length > 0) {
      query = data.queries.request[0].searchTerms;
  }

  // 3. Clean and Map Results
  const cleanResults = rawResults.map(result => ({
    title: result.title || '',
    link: result.link || '',
    snippet: result.snippet || '',
    // Optional: Keep extra metadata if needed
    pagemap: result.pagemap || {}
  }));

  returnData.push({
    json: {
      query: query,
      results: cleanResults,
      totalResults: data.searchInformation?.totalResults || 0
    }
  });
}

return returnData;
