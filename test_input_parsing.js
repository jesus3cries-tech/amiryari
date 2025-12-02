
const flattenedInput = {
    "choices[0].message.content": "## Flattened Title\n\nThis is content from a flattened key."
};

const nestedInput = {
    "choices": [
        {
            "message": {
                "content": "## Nested Title\n\nThis is content from a nested object."
            }
        }
    ]
};

function extractContent(json) {
    if (json["choices[0].message.content"]) {
        return json["choices[0].message.content"];
    }
    if (json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content) {
        return json.choices[0].message.content;
    }
    return "";
}

console.log("Flattened Result:", extractContent(flattenedInput));
console.log("Nested Result:", extractContent(nestedInput));

const longText = "Word ".repeat(500);
const first300Words = longText.split(/\s+/).slice(0, 300).join(" ");
console.log("Word count of cut:", first300Words.split(/\s+/).length);
