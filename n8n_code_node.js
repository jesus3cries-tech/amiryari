// ============================================
// 📊 STEP 3: Prepare Search Queries (Dynamic & Targeted)
// ============================================

const items = $input.all();
const results = [];

// Helper to process a single opportunity
function processOpportunity(opp) {
    // Ensure keywords are safe for query but allow English (a-zA-Z) and Persian chars
    const keywords = opp.keyword || opp.keywords_fa || opp.keywords_en || '';

    // Allow Persian chars, English (a-zA-Z), numbers, spaces, and basic punctuation (.,-:)
    const cleanKeywords = keywords.replace(/[^\u0600-\u06FFa-zA-Z0-9\s\.\-:]/g, ' ').trim();

    let query = '';
    let targetDomain = '';

    // 🎯 Dynamic Search Strategy based on Type
    if (opp.type === 'internal') {
        // Internal: Search zarinhoney.com
        // Ensure site: operator is preserved or added if missing
        if (!cleanKeywords.includes('site:')) {
             query = `${cleanKeywords} site:zarinhoney.com`;
        } else {
             query = cleanKeywords;
        }
        targetDomain = 'zarinhoney.com';
    } else {
        // External: Strictly validated Iranian domains
        // Using OR operator for Google/Serper
        query = `${cleanKeywords} (site:.gov.ir OR site:.ac.ir OR site:.org.ir)`;
        targetDomain = 'iranian_validated';
    }

    return {
        json: {
        ...opp,
        query: query,
        targetDomain: targetDomain,
        searchType: opp.type || 'external'
        }
    };
}

for (const item of items) {
    const data = item.json;
    let parsedOpportunities = [];

    // 🔍 EXTRACT JSON FROM GEMINI RESPONSE
    // Handle complex nested structure: content.parts[].text
    if (data.content && data.content.parts && Array.isArray(data.content.parts)) {
        // Find the part containing the JSON code block
        const jsonPart = data.content.parts.find(part =>
            part.text && (part.text.includes('```json') || part.text.includes('"opportunities":'))
        );

        if (jsonPart) {
            try {
                // Extract text between ```json and ```
                const match = jsonPart.text.match(/```json\s*([\s\S]*?)\s*```/);
                const jsonString = match ? match[1] : jsonPart.text;
                const parsed = JSON.parse(jsonString);
                if (parsed.opportunities) {
                    parsedOpportunities = parsed.opportunities;
                }
            } catch (e) {
                console.error("❌ Failed to parse JSON from Gemini part:", e.message);
            }
        }
    }
    // Fallback: Direct property access if not nested (standard n8n AI node output sometimes)
    else if (data.opportunities) {
        parsedOpportunities = data.opportunities;
    }
    // Fallback: Check 'choices' format (OpenAI style) if used interchangeably
    else if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
         try {
            const content = data.choices[0].message.content;
            const match = content.match(/```json\s*([\s\S]*?)\s*```/);
            const jsonString = match ? match[1] : content;
            const parsed = JSON.parse(jsonString);
            if (parsed.opportunities) parsedOpportunities = parsed.opportunities;
         } catch (e) {
            console.error("❌ Failed to parse JSON from choices:", e.message);
         }
    }
    // Fallback: Check 'output' property (Stringified JSON) - THIS WAS ADDED
    else if (data.output && typeof data.output === 'string') {
        try {
            let jsonString = data.output;
            // Check if wrapped in code block
            const match = jsonString.match(/```json\s*([\s\S]*?)\s*```/) || jsonString.match(/```\s*([\s\S]*?)\s*```/);
            if (match && match[1]) {
                jsonString = match[1];
            }
            const parsed = JSON.parse(jsonString);
            if (parsed.opportunities) {
                parsedOpportunities = parsed.opportunities;
            }
        } catch (e) {
            console.error("❌ Failed to parse JSON from output string:", e.message);
        }
    }

    // Process extracted opportunities
    if (parsedOpportunities.length > 0) {
        for (const opp of parsedOpportunities) {
            results.push(processOpportunity(opp));
        }
    } else {
        // If it's a single opportunity passed directly (legacy support)
        if (data.claim || data.keywords_fa) {
             results.push(processOpportunity(data));
        }
    }
}

return results;