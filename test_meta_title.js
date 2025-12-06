
function processTitle(title) {
  let finalTitle = title;
  const brand = 'زرین کندو';

  console.log(`Original Length: ${finalTitle.length}`);

  // محدودیت 60 کاراکتر
  if (finalTitle.length > 60) {
    console.log("Triggered truncation logic");
    const parts = finalTitle.split(' - ');
    if (parts.length >= 2) {
      const mainPart = parts[0];
      const secondPart = parts[1].split(' | ')[0];

      // The user's code:
      const availableSpace = 60 - 4 - brand.length; // 4 for " - " and " | "
      console.log(`Available Space: ${availableSpace}`);

      const maxMain = Math.floor(availableSpace * 0.6);
      const maxSecond = availableSpace - maxMain;
      console.log(`MaxMain: ${maxMain}, MaxSecond: ${maxSecond}`);

      const shortMain = mainPart.length > maxMain ? mainPart.substring(0, maxMain).trim() : mainPart;
      const shortSecond = secondPart.length > maxSecond ? secondPart.substring(0, maxSecond).trim() : secondPart;

      finalTitle = `${shortMain} - ${shortSecond} | ${brand}`;
    }
  }

  console.log(`Final Title: ${finalTitle}`);
  console.log(`Final Length: ${finalTitle.length}`);
  return finalTitle;
}

const longTitle = "This is a very long main title that goes on and on - And this is a subtitle that is also quite long | OldBrand";
processTitle(longTitle);
