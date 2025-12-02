
// ============================================
// 📊 STEP 5: Extract Best URL (Refined for Context Preservation)
// ============================================

const fs = require('fs');

// Mock inputs
const serperResults = JSON.parse(fs.readFileSync('mock_step4.json', 'utf8'));
const contextItems = JSON.parse(fs.readFileSync('mock_step3.json', 'utf8'));

// Simulating $input.all() for the current node (Serper Output)
const $input = {
  all: () => serperResults.map(item => ({ json: item }))
};

// Simulating $('Node Name').all()
const $node = {
  '3️⃣ Prepare Query': {
      all: () => contextItems.map(item => ({ json: item }))
  }
};

function runNode() {
    const items = $input.all();
    // Get original context from the pre-search node to ensure we don't lose metadata
    const originalContexts = $node['3️⃣ Prepare Query'].all();

    const results = [];

    for (let i = 0; i < items.length; i++) {
        const serperData = items[i].json;
        // Merge with original context (claim, section, keywords, etc.)
        // We assume 1-to-1 mapping (index based) which is standard for HTTP nodes
        const contextData = originalContexts[i] ? originalContexts[i].json : {};

        // Combine data: Serper data might overwrite some keys, so we prioritize context for metadata
        const data = {
            ...serperData,
            ...contextData, // This restores 'claim', 'section', 'searchType', etc.
            // If Serper has useful meta like 'searchParameters', keep it if needed,
            // but contextData.searchQuery should match serperData.searchParameters.q
        };

        const organic = serperData.organic || [];

        let isInternal = data.searchType === 'internal';

        // Robustness: If type is missing, re-infer
        if (!data.searchType && data.searchQuery) {
            if (data.searchQuery.includes('site:zarinhoney.com')) {
                isInternal = true;
            }
        }

        let bestResult = null;
        let bestScore = -1000;

        // 🧠 Scoring Algorithm
        for (const result of organic) {
            let score = 0;
            const link = result.link || '';
            const title = result.title || '';
            const linkLower = link.toLowerCase();

            if (isInternal) {
                // Strict check for zarinhoney.com
                if (linkLower.includes('zarinhoney.com')) {
                    score += 100;
                } else {
                    score = -1000; // Reject non-internal
                }
            } else {
                // External Logic: STRICTLY enforce .gov.ir, .ac.ir, .org.ir
                if (linkLower.includes('.gov.ir')) score += 100;
                else if (linkLower.includes('.ac.ir')) score += 100;
                else if (linkLower.includes('.org.ir')) score += 100;
                else score -= 1000; // REJECT everything else
            }

            // Relevance check
            // Use keywords from context if available
            const keywordsString = data.keywords_fa || data.keyword || '';
            if (keywordsString) {
                // Sanitize keywords
                const cleanKeywords = keywordsString.replace(/[^\u0600-\u06FF\s]/g, ' ').split(/\s+/);
                let matchCount = 0;
                for(const word of cleanKeywords) {
                    if (word.length > 2 && title.includes(word)) matchCount++;
                }
                score += matchCount * 2;
            }

            // Penalize PDF/Doc
            if (linkLower.endsWith('.pdf') || linkLower.endsWith('.doc')) score -= 50;

            // Select the winner
            if (score > bestScore) {
                bestScore = score;
                bestResult = result;
            }
        }

        // Threshold check: Must be a positive score (meaning matched domain criteria)
        if (bestResult && bestScore > 0) {
            results.push({
                json: {
                    ...data, // This now includes 'claim', 'section', 'type' from context
                    foundTitle: bestResult.title,
                    foundLink: bestResult.link,
                    foundSnippet: bestResult.snippet,
                    domainScore: bestScore,
                    sourceType: isInternal ? 'Internal' : 'Validated_External',
                }
            });
        } else if (isInternal) {
            // FALLBACK for Internal
            results.push({
                json: {
                    ...data,
                    foundTitle: 'خرید بهترین عسل طبیعی و ارگانیک | زرین عسل',
                    foundLink: 'https://zarinhoney.com/shop/',
                    foundSnippet: 'خرید آنلاین عسل طبیعی و محصولات ارگانیک زنبور عسل با ضمانت کیفیت از زرین عسل.',
                    domainScore: 50,
                    sourceType: 'Internal_Fallback',
                }
            });
        }
    }

    return results;
}

console.log(JSON.stringify(runNode(), null, 2));
