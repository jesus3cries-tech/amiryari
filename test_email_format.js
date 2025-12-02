
const inputData = [
    {
        json: {
            VideoURL: "https://instagram.com/p/1",
            Like: 500,
            CM: 50,
            Caption: "High Likes"
        }
    },
    {
        json: {
            VideoURL: "https://instagram.com/p/2",
            Like: 100,
            CM: 10,
            Caption: "Low Likes"
        }
    }
];

const $input = { all: () => inputData };

// Code from Format Email node
const items = $input.all().map(i => i.json);
const validItems = items.filter(item => item.VideoURL && item.VideoURL.toString().trim() !== '');

validItems.sort((a, b) => {
  const likesA = parseInt(a.Like || 0);
  const likesB = parseInt(b.Like || 0);
  return likesB - likesA;
});

const top10 = validItems.slice(0, 10);

let html = `
<table>
    <tbody>
`;

for (const item of top10) {
  const caption = item.Caption || 'No Caption';
  const link = item.VideoURL || '#';

  html += `
      <tr>
        <td>${parseInt(item.Like || 0).toLocaleString()}</td>
        <td>${parseInt(item.CM || 0).toLocaleString()}</td>
      </tr>
  `;
}

html += `</tbody></table>`;

if (html.includes("500") && html.includes("50") && top10[0].Like === 500) {
    console.log("TEST PASSED");
} else {
    console.log("TEST FAILED");
    console.log(html);
}
