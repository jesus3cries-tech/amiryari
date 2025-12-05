// ============================================
// 📊 STEP 5: Extract Best URL (Context Preserved)
// ============================================

const items = $input.all();
// 🔑 CRITICAL: Fetch original context from the pre-search node
// This ensures we recover 'claim', 'section', and 'searchType' that Serper output might have replaced
const originalContexts = $('3️⃣ Prepare Query').all();

const results = [];

for (let i = 0; i < items.length; i++) {
    const serperData = items[i].json;
    // Merge Serper results with original context by index (1-to-1 mapping)
    const contextData = originalContexts[i] ? originalContexts[i].json : {};

    // Combine data: Prioritize context for metadata
    const data = {
        ...serperData,
        ...contextData // This restores 'claim', 'section', 'searchType', 'keywords_fa'
    };

    const organic = serperData.results || serperData.organic || serperData.items || [];

    // Logic to determine if Internal (zarinhoney) or External
    let isInternal = data.searchType === 'internal';

    // Robustness: If type is missing, re-infer from query or keyword
    const queryToCheck = data.query || data.searchQuery;
    if (!data.searchType && queryToCheck) {
        if (queryToCheck.includes('site:zarinhoney.com')) {
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

        // Relevance check using keywords
        const keywordsString = data.keywords_fa || data.keyword || '';
        if (keywordsString) {
            // Simple keyword matching for bonus points
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

    // Threshold check
    if (bestResult && bestScore > 0) {
        results.push({
            json: {
                ...data, // Preserves 'claim' and 'section'
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
