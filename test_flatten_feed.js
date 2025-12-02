
const inputData = [
  {
    "json": {
      "status": "ok",
      "data": {
        "sections": [
          {
            "layout_type": "one_by_two_left",
            "layout_content": {
              "medias": null
            },
            "feed_type": "clips",
            "explore_item_info": {
              "num_columns": 3,
              "total_num_columns": 3,
              "aspect_ratio": 1.5,
              "autoplay": true
            }
          },
          {
            "layout_type": "media_grid",
            "layout_content": {
              "medias": [
                {
                  "media": {
                    "id": "3778087256473486747_48447708001",
                    "pk": 3778087256473487000,
                    "code": "DRudle0iEWb",
                    "media_type": 1,
                    "image_versions2": {
                      "candidates": [
                        {
                          "url": "https://instagram.com/image1.jpg"
                        }
                      ]
                    },
                    "caption": {
                        "text": "Caption 1"
                    },
                    "user": {
                        "username": "user1",
                        "full_name": "User One"
                    },
                    "like_count": 100,
                    "comment_count": 10,
                    "play_count": 1000
                  }
                },
                {
                   "media": {
                    "id": "3756529580375907035_52734241747",
                    "code": "DQh38AajZrb",
                     "image_versions2": {
                      "candidates": [
                        {
                          "url": "https://instagram.com/image2.jpg"
                        }
                      ]
                    },
                    "video_versions": [
                        {
                            "url": "https://instagram.com/video2.mp4"
                        }
                    ],
                    "caption": {
                        "text": "Caption 2"
                    },
                    "user": {
                        "username": "user2"
                    },
                    "like_count": 200,
                    "comment_count": 20
                   }
                }
              ]
            }
          }
        ]
      }
    }
  }
];

// Simulate n8n $input.all()
const $input = { all: () => inputData };

// Code from Flatten Feed node
const results = [];

for (const item of $input.all()) {
  const data = item.json.data || item.json;

  // Handle if data is array or object with sections
  const sections = data.sections || (data.data && data.data.sections);

  if (sections) {
    for (const section of sections) {
      if (section.layout_content && section.layout_content.medias) {
        for (const mediaWrapper of section.layout_content.medias) {
          if (mediaWrapper.media) {
             const media = mediaWrapper.media;

             let imageUrl = null;
             if (media.image_versions2 && media.image_versions2.candidates && media.image_versions2.candidates.length > 0) {
                 imageUrl = media.image_versions2.candidates[0].url;
             }

             let videoUrl = null;
             if (media.video_versions && media.video_versions.length > 0) {
                 videoUrl = media.video_versions[0].url;
             }

             results.push({
               json: {
                 id: media.id,
                 pk: media.pk,
                 code: media.code,
                 url: `https://www.instagram.com/p/${media.code}/`,
                 caption: media.caption ? media.caption.text : '',
                 username: media.user ? media.user.username : '',
                 full_name: media.user ? media.user.full_name : '',
                 like_count: media.like_count,
                 comment_count: media.comment_count,
                 play_count: media.play_count,
                 media_type: media.media_type,
                 image_url: imageUrl,
                 video_url: videoUrl
               }
             });
          }
        }
      }
    }
  }
}

console.log("Results length:", results.length);
console.log("First Item Code:", results[0].json.code);
console.log("Second Item VideoURL:", results[1].json.video_url);

if (results.length === 2 && results[0].json.code === 'DRudle0iEWb' && results[1].json.video_url === 'https://instagram.com/video2.mp4') {
    console.log("TEST PASSED");
} else {
    console.log("TEST FAILED");
}
