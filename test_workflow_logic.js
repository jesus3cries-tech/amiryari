
// Mock Data
const mockInputDeduplicate = [
  // Existing Archive Item (URL format 1)
  {
    json: {
      "row_number": 1,
      "VideoURL": "https://www.instagram.com/reel/C3yXYZ123/?igsh=...",
      "Caption": "Old post",
      "Like": "100"
    }
  },
  // New Scraper Item (URL format 2 - same post but different link format)
  // This should be DETECTED AS DUPLICATE by ShortCode
  {
    json: {
      "Post URL": "https://www.instagram.com/p/C3yXYZ123/", // Same ID "C3yXYZ123"
      "Code": "C3yXYZ123", // ShortCode provided by Apify
      "Caption": "New Viral Post (Duplicate)",
      "Likes": 5000,
      "inputUrl": "https://www.instagram.com/explore/tags/relationshipcoach/"
    }
  },
  // New Unique Post
  {
    json: {
      "Post URL": "https://www.instagram.com/reel/NewUnique456/",
      "Code": "NewUnique456",
      "Caption": "New Unique Post",
      "Likes": 200,
      "inputUrl": "https://www.instagram.com/explore/tags/datingtips/"
    }
  }
];

console.log("--- Testing Deduplicate Node (ShortCode Logic) ---");
function runDeduplicate(inputs) {
    const $input = { all: () => inputs };

    // PASTE CODE START
    const allItems = $input.all();
    const existingShortCodes = new Set();
    const newCandidates = [];

    // Helper to extract Instagram ShortCode
    // Supports /p/, /reel/, /tv/
    function getShortCode(url) {
        if (!url) return null;
        try {
            const match = url.match(/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
            return match ? match[1] : null;
        } catch (e) {
            return null;
        }
    }

    // First pass: Identify existing ShortCodes from Archive
    for (const item of allItems) {
        const json = item.json;

        // Existing items (Archive)
        if (json.row_number !== undefined || (json.VideoURL !== undefined && !json['Post URL'])) {
            if (json.VideoURL) {
                const sc = getShortCode(json.VideoURL.toString());
                if (sc) existingShortCodes.add(sc);
            }
        }
        // New items (Scraper)
        else if (json["Post URL"]) {
            newCandidates.push(item);
        }
    }

    const uniqueItems = [];

    // Second pass: Filter candidates
    for (const item of newCandidates) {
        let sc = item.json["Code"]; // Use provided Code if available
        if (!sc) {
            sc = getShortCode(item.json["Post URL"]); // Fallback to URL parsing
        }

        // Only add if we haven't seen this ShortCode
        if (sc && !existingShortCodes.has(sc)) {
            uniqueItems.push({
                json: {
                    VideoURL: item.json["Post URL"],
                    Caption: item.json["Caption"],
                    Like: item.json["Likes"],
                    CM: item.json["Comments"],
                    View: item.json["Views"] || 0,
                    Date: new Date().toISOString().split('T')[0],
                    searchedHashtag: item.json["searchedHashtag"] || '' // Pass through if available
                }
            });
            // Add to set to prevent duplicates within the new batch
            existingShortCodes.add(sc);
        }
    }

    return uniqueItems;
    // PASTE CODE END
}

const dedupOutput = runDeduplicate(mockInputDeduplicate);
console.log("Deduplicate Output:", JSON.stringify(dedupOutput, null, 2));
