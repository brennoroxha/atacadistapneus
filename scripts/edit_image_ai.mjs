import fs from 'fs';

async function editImage(imagePath, outputPath, instruction) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error('LOVABLE_API_KEY not found');

  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');

  console.log(`Editing ${imagePath}...`);

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-3-pro-image-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: instruction },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
          ]
        }
      ],
      modalities: ['image', 'text']
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI Gateway error: ${error}`);
  }

  const data = await response.json();
  const editedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

  if (!editedImageUrl) {
    console.error(JSON.stringify(data).slice(0, 500));
    throw new Error('No image returned from AI Gateway');
  }

  const base64Data = editedImageUrl.replace(/^data:image\/\w+;base64,/, '');
  fs.writeFileSync(outputPath, Buffer.from(base64Data, 'base64'));
  console.log(`Saved to ${outputPath}`);
}

const instr = "This is my own product photo for my e-commerce store. Please clean up the bottom-right corner by extending the white studio background to fill that area, removing any text or graphics that are there. The tire should remain exactly the same. Output a clean product photo with only the tire on a seamless white background.";

for (const i of [2, 3, 4]) {
  await editImage(`/tmp/kelly/orig0${i}.jpg`, `/tmp/kelly/clean0${i}.jpg`, instr);
}
