
// ============================================
// 📝 Map Generated Anchors to Context (No Require)
// ============================================

// Mock Data for Testing
const aiResponses = [
    {
        json: {
            choices: [{ message: { content: "علل علمی شوره سر" } }]
        }
    },
    {
        json: {
            choices: [{ message: { content: "خرید عسل طبیعی" } }]
        }
    }
];

const allItems = [
    {
        json: {
            link: "https://tum.ac.ir/news/dandruff-causes",
            title: "علل شوره سر",
            originalClaim: "این مشکل معمولاً به دلیل خشکی پوست سر... به وجود می‌آید.",
            section: "عوامل ایجاد شوره سر",
            index: 0
        }
    },
    {
        json: {
            link: "https://zarinhoney.com/product/natural-honey",
            title: "خرید عسل",
            originalClaim: "عسل خواص شگفت انگیز دارد",
            section: "عسل درمانی",
            index: 1
        }
    }
];

// Simulation of n8n inputs
const $input = { all: () => aiResponses.map(i => ({ json: i.json })) };
const $node = { 'Split for Anchor1': { all: () => allItems.map(i => ({ json: i.json })) } };
function $(nodeName) { return $node[nodeName]; }

function runNode() {
    // Get all AI responses (Generated Anchors)
    const aiResponses = $input.all();
    // Get all original items from the Split node (Context: Link, Claim, Section)
    const allItems = $('Split for Anchor1').all();

    const results = [];

    // Helper function to extract domain without 'url' module
    function getDomain(url) {
        if (!url) return '';
        try {
            // Remove protocol
            let domain = url.indexOf("://") > -1 ? url.split('/')[2] : url.split('/')[0];
            // Remove port if present
            domain = domain.split(':')[0];
            // Remove query params if present
            domain = domain.split('?')[0];
            return domain;
        } catch (e) {
            return 'unknown';
        }
    }

    // Loop through each AI response
    for (let i = 0; i < aiResponses.length; i++) {
        const aiResponse = aiResponses[i].json;
        let anchorText = '';

        // Extract anchor text from AI response
        if (aiResponse.choices && aiResponse.choices[0]) {
            anchorText = aiResponse.choices[0].message.content.trim();
        } else if (aiResponse.message && aiResponse.message.content) {
            // Handle Gemini/OpenAI variations
            anchorText = aiResponse.message.content.trim();
        }

        // Get the corresponding original link data using the index
        const originalLink = allItems[i]?.json || {};

        // Fallback if anchor is empty or too short
        if (!anchorText || anchorText.length < 3) {
            // Use title or keywords if AI fails
            anchorText = originalLink.title ? originalLink.title.substring(0, 50) : 'لینک مرتبط';
        }

        // Clean anchor text (remove quotes if AI added them)
        anchorText = anchorText.replace(/^["']|["']$/g, '');

        let domain = '';
        if (originalLink.domain) {
            domain = originalLink.domain;
        } else if (originalLink.link) {
            domain = getDomain(originalLink.link);
        }

        // Push the combined result
        results.push({
            json: {
                url: originalLink.link,
                anchor: anchorText,
                domain: domain,
                index: originalLink.index,
                title: originalLink.title,
                snippet: originalLink.snippet,
                // 🔑 Preserving fields for the final output
                claim: originalLink.originalClaim || originalLink.claim,
                section: originalLink.section
            }
        });
    }

    return results;
}

console.log(JSON.stringify(runNode(), null, 2));
