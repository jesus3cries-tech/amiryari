// =======================================================
// 🔧 Fix Damaged Links Code Node (Robust Version)
// =======================================================
// This node corrects URLs that may have been damaged by the AI link insertion node.
// It uses the $items("Node Name") syntax to reliably fetch data from the correct
// preceding nodes.
// =======================================================

// 1. Directly reference the output from the two parent nodes by name.
// This is the most reliable way to get data from multiple inputs in n8n.
// Note: Ensure these names EXACTLY match the names of the nodes in your workflow.
const mergedItems = $items("Merge Links & Content");
const sanitizedItems = $items("Sanitize Links");

// Error handling: Check if the nodes returned any data.
// This can happen if a node is disconnected or has an error.
if (mergedItems.length === 0) {
  throw new Error("The 'Merge Links & Content' node did not return any data. Please check its connection and execution status.");
}
if (sanitizedItems.length === 0) {
  throw new Error("The 'Sanitize Links' node did not return any data. Please check its connection and execution status.");
}

// Since we expect each parent node to only output one item, we grab the first one.
const mergedItem = mergedItems[0];
const sanitizedItem = sanitizedItems[0];


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
