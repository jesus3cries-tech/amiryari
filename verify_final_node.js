
// ============================================
// 📊 STEP 11: Final Links Merge Verification
// ============================================

const fs = require('fs');

// Mock Input: Result of "Extract Anchor"
// This node receives an array of items where each item has the anchor text AND the original metadata
// because Extract Anchor merged them.

const mockExtractAnchorInput = [
    {
        "url": "https://tum.ac.ir/news/dandruff-causes",
        "anchor": "علل علمی شوره سر",
        "domain": "tum.ac.ir",
        "index": 0,
        "title": "علل شوره سر و درمان آن - دانشگاه علوم پزشکی تهران",
        "snippet": "شوره سر به دلایل...",
        "claim": "این مشکل معمولاً به دلیل خشکی پوست سر، نوعی اختلال در غدد چربی، یا واژگونی میکروبی به وجود می‌آید.",
        "section": "شوره سر: یک مشکل شایع و دل‌سوز"
    },
    {
        "url": "https://zarinhoney.com/product/natural-honey",
        "anchor": "خرید عسل طبیعی",
        "domain": "zarinhoney.com",
        "index": 1,
        "title": "خرید عسل طبیعی - زرین عسل",
        "snippet": "بهترین عسل...",
        "claim": "عسل به عنوان یکی از محصولات طبیعی با خواص شگفت‌انگیز شناخته می‌شود.",
        "section": "عسل: یک درمان طبیعی فوق‌العاده"
    }
];

const $input = {
    all: () => mockExtractAnchorInput.map(item => ({ json: item }))
};

function runNode() {
    const items = $input.all();

    const finalLinks = items.map((item, idx) => {
        const data = item.json;

        return {
            index: idx,
            url: data.url,
            anchor: data.anchor,
            domain: data.domain || new URL(data.url).hostname,
            section: data.section,
            claim: data.claim, // This is the crucial field the user requested
            originalTitle: data.title // Adding this as extra context usually helps
        };
    });

    return {
        json: {
            links: finalLinks,
            totalLinks: finalLinks.length,
            readyForInsertion: true
        }
    };
}

console.log(JSON.stringify(runNode(), null, 2));
