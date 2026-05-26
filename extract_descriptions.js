import fs from 'fs';
import { XMLParser } from 'fast-xml-parser';

const xmlData = fs.readFileSync('/tmp/feed.xml', 'utf-8');
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
