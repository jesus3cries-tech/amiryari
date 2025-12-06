
// Mock logic
const aiResponse = {
  json: {
    choices: [
      {
        message: {
          content: JSON.stringify({
            title: "This is a very long main title that goes on and on - And this is a subtitle that is also quite long | OldBrand",
            metaDescription: "This is a normal description."
          })
        }
      }
    ]
  }
};

const previousData = {
    json: {
        postId: 123,
        focusKeywords: ["honey", "health"]
    }
};

const $input = {
    first: () => aiResponse
};

const $ = (nodeName) => {
    return {
        first: () => previousData
    };
};

// Paste the code logic here (wrapped in a function)
function runCode() {
    const fs = require('fs');
    const code = fs.readFileSync('fix_meta_title.js', 'utf8');

    // Evaluate the code
    // We need to provide the environment variables ($input, $)
    // Using Function constructor or eval
    const func = new Function('$input', '$', code);
    return func($input, $);
}

try {
    const result = runCode();
    console.log(JSON.stringify(result, null, 2));
} catch (e) {
    console.error(e);
}
