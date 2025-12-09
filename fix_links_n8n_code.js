// =======================================================
// 🔧 Fix Damaged Links Code Node (Corrected)
// =======================================================
// This node corrects URLs that may have been damaged by the AI link insertion node.
// It finds the final text from "Merge Links & Content" and the correct link data
// from "Sanitize Links" to produce a corrected output.
// =======================================================

// n8n combines multiple inputs into a single array of items.
const allItems = $input.all();

// 1. Identify the two inputs based on their data structure.
// This is robust and doesn't depend on the connection order.

// Input from "Merge Links & Content" has an 'output' string property.
const mergedItem = allItems.find(item => item.json.output && typeof item.json.output === 'string' && !item.json.links);

// Input from "Sanitize Links" has a 'links' array property.
const sanitizedItem = allItems.find(item => item.json.links && Array.isArray(item.json.links));

// Error handling in case the inputs aren't connected correctly.
if (!mergedItem) {
  throw new Error("Could not find the input from 'Merge Links & Content'. It should have an 'output' property in its JSON.");
}
if (!sanitizedItem) {
  throw new Error("Could not find the input from 'Sanitize Links'. It should have a 'links' array in its JSON.");
}


// 2. Extract the necessary data.
// The 'Merge Links & Content' node outputs the final text under the 'output' key.
const damagedText = mergedItem.json.output;
const correctLinks = sanitizedItem.json.links;

// If there's no text or no links, no fix is needed.
// Return the output from the merge node as is.
if (!damagedText || !correctLinks || correctLinks.length === 0) {
  return [mergedItem];
}

// 3. Create a map of (link text -> correct URL) for efficient lookup.
const correctUrlMap = new Map();
for (const link of correctLinks) {
  // The "Sanitize Links" node provides 'link_text' and 'url'.
  if (link.link_text && link.url) {
    correctUrlMap.set(link.link_text, link.url);
  }
}

// 4. Use a regular expression to find all markdown links in the text.
const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

let replacements = 0;

// Use the .replace() method with a replacer function.
// For each markdown link found in the text, this function will be called.
const fixedText = damagedText.replace(markdownLinkRegex, (originalMatch, linkText, damagedUrl) => {
  const correctUrl = correctUrlMap.get(linkText);

  // Check if we have a correct URL for this specific link text.
  if (correctUrl) {
    if (damagedUrl !== correctUrl) {
      replacements++;
    }
    // If a match is found, build the correct markdown link and return it.
    return `[${linkText}](${correctUrl})`;
  } else {
    // If the link text from the content is not in our list of sanitized links,
    // it might be a different link. We'll leave it unchanged.
    console.log(`INFO: Link text "${linkText}" was not found in the 'Sanitize Links' input. The original link will be kept.`);
    return originalMatch;
  }
});

console.log(`SUCCESS: Found and replaced ${replacements} incorrect URLs.`);

// 5. Prepare the final output.
// We clone the original output from the "Merge Links & Content" node
// and just replace the 'output' property with our fixed version. This preserves
// any other data that node might have outputted.
const finalOutput = JSON.parse(JSON.stringify(mergedItem));
finalOutput.json.output = fixedText;

// Return the result for the next node in your workflow.
return [finalOutput];
