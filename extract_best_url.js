// =========================================================
// 📊 STEP 5: Extract Best URL (Mother Code - Universal)
// =========================================================
// This node is designed to be compatible with multiple search providers
// (Google Custom Search, Serper, Bing, etc.) and is driven by input parameters.

// 🛠️ CONFIGURATION
const PREVIOUS_NODE_NAME = '3️⃣ Prepare Query'; // Node to fetch context from
const INTERNAL_DOMAIN = 'zarinhoney.com';
const VALIDATED_DOMAINS_KEY = 'iranian_validated';
const VALIDATED_TLDS = ['.gov.ir', '.ac.ir', '.org.ir'];

const items = $input.all();
let originalContexts = [];

try {
    // 🔑 CRITICAL: Fetch original context from the pre-search node
    // This ensures we recover 'claim', 'section', and 'searchType'
    originalContexts = $(PREVIOUS_NODE_NAME).all();
} catch (e) {
    // Graceful fallback if node name changed or not found
    console.log(`Info: Could not fetch context from "${PREVIOUS_NODE_NAME}". using input as is.`);
}

const results = [];

for (let i = 0; i < items.length; i++) {
    const serperData = items[i].json;

    // Merge Serper results with original context by index (1-to-1 mapping)
    // If contexts length mismatch, fallback to empty object
    const contextData = (originalContexts.length > i) ? originalContexts[i].json : {};

    // Combine data: Prioritize context for metadata
    const data = { ...serperData, ...contextData };

    // 🔍 UNIFY SEARCH RESULTS (Support Google, Serper, Bing, etc.)
    const candidates = data.results ||
                       data.organic ||
                       data.items ||
                       data.webPages?.value ||
                       [];

    // 🕵️ DETECT QUERY (Fallback if context lost)
    // Try to find the query string in API response echoes if not in context
    let query = data.query || data.searchQuery || '';
    if (!query) {
        if (serperData.queries?.request?.[0]?.searchTerms) {
            query = serperData.queries.request[0].searchTerms; // Google API
        } else if (serperData.searchParameters?.q) {
            query = serperData.searchParameters.q; // Serper
        }
    }

    // 🎯 DETERMINE TARGETING STRATEGY
    // Use the 'targetDomain' parameter from the input to decide the validation logic
    const targetDomainParam = data.targetDomain || 'external';

    // Determine if Internal (zarinhoney) based on params OR query string content
    let isInternal = targetDomainParam === INTERNAL_DOMAIN || data.searchType === 'internal';

    // Robustness: Re-infer from query if explicit type is missing/lost
    if (!isInternal && query && query.includes(`site:${INTERNAL_DOMAIN}`)) {
        isInternal = true;
    }

    let bestResult = null;
    let bestScore = -1000;

    // 🧠 SCORING ALGORITHM
    for (const candidate of candidates) {
        // Standardize fields (API compatibility)
        const link = candidate.link || candidate.url || '';
        const title = candidate.title || candidate.name || '';
        const snippet = candidate.snippet || candidate.description || '';
        const linkLower = link.toLowerCase();

        if (!link) continue;

        let score = 0;

        // 1. Domain Validation Logic
        if (isInternal) {
            // Internal Mode: Strict check for internal domain
            if (linkLower.includes(INTERNAL_DOMAIN)) {
                score += 100;
            } else {
                score = -1000; // Reject non-internal
            }
        } else {
            // External Mode
            if (targetDomainParam === VALIDATED_DOMAINS_KEY || targetDomainParam === 'external') {
                // Strict validation against trusted TLDs
                const match = VALIDATED_TLDS.some(tld => linkLower.includes(tld));
                if (match) {
                    score += 100;
                } else {
                    score = -1000; // REJECT everything else
                }
            } else {
                // Generic External Mode (if specific domain targeted, e.g. 'wikipedia.org')
                if (!linkLower.includes(targetDomainParam.toLowerCase())) {
                     score -= 50; // Soft penalty if specific target missed
                }
            }
        }

        // 2. Keyword Relevance
        // Bonus points if title contains keywords
        const keywordsString = data.keywords_fa || data.keyword || '';
        if (keywordsString) {
             const cleanKeywords = keywordsString.replace(/[^\u0600-\u06FF\s]/g, ' ').split(/\s+/);
             let matchCount = 0;
             for (const word of cleanKeywords) {
                 if (word.length > 2 && title.includes(word)) matchCount++;
             }
             score += matchCount * 2;
        }

        // 3. Demote file types (PDF/Doc)
        if (linkLower.endsWith('.pdf') || linkLower.endsWith('.doc')) score -= 50;

        // Select the winner
        if (score > bestScore) {
            bestScore = score;
            bestResult = { title, link, snippet };
        }
    }

    // Output Construction
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
        // FALLBACK for Internal (if search failed or returned no results)
        // This ensures zarinhoney links always appear even if Google doesn't index them well yet
        results.push({
             json: {
                ...data,
                foundTitle: 'خرید بهترین عسل طبیعی و ارگانیک | زرین عسل',
                foundLink: `https://${INTERNAL_DOMAIN}/shop/`,
                foundSnippet: 'خرید آنلاین عسل طبیعی و محصولات ارگانیک زنبور عسل با ضمانت کیفیت از زرین عسل.',
                domainScore: 50,
                sourceType: 'Internal_Fallback',
             }
        });
    }
    // Note: If External and no valid result found, we do NOT push to results (filter out)
}

return results;
