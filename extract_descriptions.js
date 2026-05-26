import fs from 'fs';
import { XMLParser } from 'fast-xml-parser';

const xmlData = fs.readFileSync('5668bb2e-a50e-4d80-b276-ae3381798e58', 'utf-8');
const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_"
});
const jsonObj = parser.parse(xmlData);
const items = jsonObj.rss.channel.item;

const descriptionsMap = {};
items.forEach(item => {
    const id = item['g:id'];
    const description = item['g:description'];
    if (id && description) {
        descriptionsMap[id] = description;
    }
});

console.log(JSON.stringify(descriptionsMap));
