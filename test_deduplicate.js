
const inputData = [
    // Item 1: Existing Archive Item
    {
        json: {
            row_number: 2,
            VideoURL: "https://www.instagram.com/p/EXISTING/",
            Caption: "Old Post"
        }
    },
    // Item 2: New Scraper Item (Duplicate)
    {
        json: {
            "Post URL": "https://www.instagram.com/p/EXISTING/",
            "Caption": "New Scrape of Old Post",
            "Likes": 100,
            "Comments": 10
        }
    },
    // Item 3: New Scraper Item (Unique)
    {
        json: {
            "Post URL": "https://www.instagram.com/p/NEWPOST/",
            "Caption": "Brand New Post",
            "Likes": 500,
            "Comments": 50
        }
    },
    // Item 4: New Scraper Item (Duplicate but with params and no trailing slash)
    {
        json: {
            "Post URL": "https://www.instagram.com/p/EXISTING?igsh=123",
            "Caption": "Duplicate with params",
            "Likes": 100,
            "Comments": 10
        }
    }
];

// Simulate n8n $input.all()
const $input = { all: () => inputData };

// Code from Deduplicate node
const allItems = $input.all();
const existingUrls = new Set();
const newCandidates = [];

// Helper to normalize URLs
function normalizeUrl(url) {
    if (!url) return '';
    try {
        if (!url.startsWith('http')) return url.trim().toLowerCase();

        let normalized = url.trim();
        const queryIndex = normalized.indexOf('?');
        if (queryIndex !== -1) {
            normalized = normalized.substring(0, queryIndex);
        }
        if (normalized.endsWith('/')) {
            normalized = normalized.slice(0, -1);
        }
        return normalized.toLowerCase();
    } catch (e) {
        return url ? url.toString().trim().toLowerCase() : '';
    }
}

for (const item of allItems) {
    const json = item.json;

    if (json.row_number !== undefined || (json.VideoURL !== undefined && !json['Post URL'])) {
        if (json.VideoURL && json.VideoURL.toString().trim() !== '') {
            const normUrl = normalizeUrl(json.VideoURL);
            if (normUrl) existingUrls.add(normUrl);
        }
    }
    else if (json["Post URL"]) {
        newCandidates.push(item);
    }
}

const uniqueItems = [];

for (const item of newCandidates) {
    const rawUrl = item.json["Post URL"];
    const normUrl = normalizeUrl(rawUrl);

    if (normUrl && !existingUrls.has(normUrl)) {
        uniqueItems.push({
            json: {
                VideoURL: rawUrl,
                Caption: item.json["Caption"],
                Like: item.json["Likes"],
                CM: item.json["Comments"],
                View: item.json["Views"] || 0,
                Date: new Date().toISOString().split('T')[0]
            }
        });
        existingUrls.add(normUrl);
    }
}

console.log("Unique Items Count:", uniqueItems.length);
if (uniqueItems.length > 0) {
    console.log("Unique Item URL:", uniqueItems[0].json.VideoURL);
}

// Validation
if (uniqueItems.length === 1 && uniqueItems[0].json.VideoURL === "https://www.instagram.com/p/NEWPOST/") {
    console.log("TEST PASSED");
} else {
    console.log("TEST FAILED");
    console.log("Existing URLs:", Array.from(existingUrls));
    console.log("Result Items:", uniqueItems.map(i => i.json.VideoURL));
}
