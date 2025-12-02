const input = [
  {
    "json": {
      "Code": "DRAM0JWiOrc",
      "Username": "dr.almasepehrnia.official",
      "Caption": "New Item 1",
      "Post URL": "https://www.instagram.com/p/DRAM0JWiOrc/",
      "Likes": 1082,
      "Comments": 56
    }
  },
  {
    "json": {
      "Code": "DRw9qBmiGXw",
      "Username": "dr.ali.firoozizadeh",
      "Caption": "New Item 2",
      "Post URL": "https://www.instagram.com/p/DRw9qBmiGXw/",
      "Likes": 58,
      "Comments": 14
    }
  },
  {
    "json": {
      "row_number": 2,
      "Like": 173742,
      "CM": 4256,
      "VideoURL": "https://www.instagram.com/p/DDAj0yZux7H/",
      "Caption": "Existing Item 1"
    }
  },
  {
    "json": {
      "row_number": 3,
      "Like": 108809,
      "CM": 1186,
      "VideoURL": "https://www.instagram.com/p/DRAM0JWiOrc/",
      "Caption": "Existing Item 2 (Duplicate of New Item 1)"
    }
  },
  {
    "json": {
      "row_number": 39,
      "Like": "",
      "CM": "",
      "VideoURL": "",
      "Caption": "",
      "debug_status": "No new unique reels found"
    }
  }
];

const $input = {
    all: () => input
};

// --- Deduplicate Node Logic ---
const allItems = $input.all();
const existingUrls = new Set();
const newCandidates = [];

// First pass: Identify existing URLs and collect candidates
for (const item of allItems) {
    const json = item.json;

    // Check if it's an existing Google Sheet item
    // Existing items have 'VideoURL' or 'row_number'
    if (json.row_number !== undefined || json.VideoURL !== undefined) {
        if (json.VideoURL && json.VideoURL.trim() !== '') {
            existingUrls.add(json.VideoURL.trim());
        }
    }
    // Check if it's a new item from the scraper (Success Output)
    // It must have 'Post URL'
    else if (json["Post URL"]) {
        newCandidates.push(item);
    }
}

console.log("Existing URLs:", Array.from(existingUrls));
console.log("New Candidates Count:", newCandidates.length);

const uniqueItems = [];

// Second pass: Filter candidates
for (const item of newCandidates) {
    const url = item.json["Post URL"];

    if (url && !existingUrls.has(url)) {
        uniqueItems.push({
            json: {
                VideoURL: url,
                Caption: item.json["Caption"],
                Like: item.json["Likes"],
                CM: item.json["Comments"],
                View: item.json["Views"] || 0, // Assuming Views might be added later
                Date: new Date().toISOString().split('T')[0]
            }
        });
        // Add to set to prevent duplicates within the new batch itself
        existingUrls.add(url);
    } else {
        console.log("Duplicate found and skipped:", url);
    }
}

console.log("Unique Items Output:", JSON.stringify(uniqueItems, null, 2));
