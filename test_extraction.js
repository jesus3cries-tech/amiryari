
const fullContent = `## شوره سر: یک مشکل شایع و دل‌سوز

شوره سر یکی از مشکلات شایع در جامعه است که بسیاری از افراد به آن دچار می‌شوند. این مشکل معمولاً به دلیل خشکی پوست سر، نوعی اختلال در غدد چربی، یا واژگونی میکروبی به وجود می‌آید. شوره سر نه تنها می‌تواند به احساس خجالت و کم‌اعتمادی به نفس منجر شود، بلکه ممکن است به خارش و تحریک پوست سر نیز دامن بزند.

### عوامل ایجاد شوره سر

عوامل مختلفی وجود دارند که می‌توانند در ایجاد شوره سر نقش ایفا کنند:

1. **خشکی پوست:** یکی از رایج‌ترین دلایل شوره سر، خشکی پوست است. با کاهش رطوبت در پوست سر، سلول‌های مرده به راحتی جدا می‌شوند و به شکل شوره روی سر ظاهر می‌شوند.
`;

// Proposed logic

// 1. Title Extraction
// Allow # or ##.
const titleMatch = fullContent.match(/^#{1,2}\s+(.+)/m);
const articleTitle = titleMatch ? titleMatch[1] : "موضوع مشخص نشده";

console.log("Extracted Title:", articleTitle);

// 2. Intro Extraction
// Strategy:
// A. Look for specific "مقدمه" section.
// B. If not found, look for text between the Title Line and the *next* header (of any level).

let currentIntro = "";

// Method A: Explicit 'Intro' header
const explicitIntroMatch = fullContent.match(/##\s+مقدمه\s+([\s\S]*?)(?=##|$)/);

if (explicitIntroMatch) {
    console.log("Found explicit Intro header");
    currentIntro = explicitIntroMatch[1].trim();
} else {
    // Method B: Text after title, before next header
    console.log("No explicit Intro header, using Fallback");

    if (titleMatch) {
        // Get content starting after the title match
        const contentAfterTitle = fullContent.substring(titleMatch.index + titleMatch[0].length);

        // Find the next header (starting with #)
        // We look for \n# to ensure we catch new headers
        const nextHeaderMatch = contentAfterTitle.match(/\n#+\s/);

        if (nextHeaderMatch) {
            currentIntro = contentAfterTitle.substring(0, nextHeaderMatch.index).trim();
        } else {
            // No other headers found, take it all
            currentIntro = contentAfterTitle.trim();
        }
    }
}

console.log("Extracted Intro Length:", currentIntro.length);
console.log("Extracted Intro Preview:", currentIntro.substring(0, 100));
