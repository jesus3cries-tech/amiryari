const aiResponse = $input.first().json;
const previousData = $('🔧 Prepare AI Request').first().json;

// استخراج JSON از پاسخ AI
let aiContent = aiResponse.choices[0].message.content;
const jsonMatch = aiContent.match(/\{[\s\S]*\}/);

if (!jsonMatch) {
  throw new Error('❌ JSON در پاسخ AI یافت نشد!');
}

const metadata = JSON.parse(jsonMatch[0]);

// پاکسازی عنوان
let finalTitle = metadata.title
  .replace(/<[^>]+>/g, '')
  .replace(/[{}<>*\\]/g, '')
  .trim();

// محدودیت 75 کاراکتر (اجازه عبور متن تا 60 کاراکتر + برند)
// Limit increased to 75 to allow ~60 chars of text + 15 chars of overhead (separators + brand)
const MAX_TITLE_LENGTH = 75;

if (finalTitle.length > MAX_TITLE_LENGTH) {
  const parts = finalTitle.split(' - ');
  if (parts.length >= 2) {
    const mainPart = parts[0];
    const secondPart = parts[1].split(' | ')[0];
    const brand = 'زرین کندو';

    // Correct calculation:
    // Total Limit (75) - Separators (6 chars for " - " and " | ") - Brand (9 chars)
    // 75 - 6 - 9 = 60 characters available for text
    const availableSpace = MAX_TITLE_LENGTH - 6 - brand.length;

    const maxMain = Math.floor(availableSpace * 0.6);
    const maxSecond = availableSpace - maxMain;

    const shortMain = mainPart.length > maxMain ? mainPart.substring(0, maxMain).trim() : mainPart;
    const shortSecond = secondPart.length > maxSecond ? secondPart.substring(0, maxSecond).trim() : secondPart;

    finalTitle = `${shortMain} - ${shortSecond} | ${brand}`;
  }
}

// پاکسازی توضیحات
let finalDesc = metadata.metaDescription
  .replace(/<[^>]+>/g, '')
  .replace(/[{}<>*\\]/g, '')
  .replace(/\.\.\./g, '')
  .trim();

// محدودیت 150 کاراکتر
if (finalDesc.length > 150) {
  finalDesc = finalDesc.substring(0, 147).trim();
}

// خروجی
return [{
  json: {
    post_id: previousData.postId,
    rank_math_title: finalTitle,
    rank_math_description: finalDesc,
    rank_math_focus_keyword: previousData.focusKeywords.join(', '),
    rank_math_keywords: previousData.focusKeywords.join(', '),
    debug: {
      originalTitle: metadata.title,
      titleLength: finalTitle.length,
      descLength: finalDesc.length,
      focusKeywords: previousData.focusKeywords
    }
  }
}];
