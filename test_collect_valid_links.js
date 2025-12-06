const fs = require('fs');

// Mock n8n environment
const $input = {
    all: () => {
        const rawData = fs.readFileSync('test_step9_data.json', 'utf8');
        const items = JSON.parse(rawData);
        return items.map(item => ({ json: item }));
    }
};

// Read the code
const code = fs.readFileSync('collect_valid_links.js', 'utf8');

// Function wrapper to execute the code
function runCode() {
    // The code ends with return, so we wrap it in a function and call it
    const wrappedCode = `(function() {
${code}
    })()`;

    // Eval the IIFE
    return eval(wrappedCode);
}

try {
    const result = runCode();
    console.log(JSON.stringify(result, null, 2));
} catch (error) {
    console.error("Error executing code:", error);
}
