import fs from 'node:fs';
import os from 'node:os';
const bytes=fs.readFileSync('render/output/reference-final.log');
const logs=bytes.toString(bytes[0]===255&&bytes[1]===254?'utf16le':'utf8').split(/\r?\n/);
const samples=logs.filter(line=>line.includes('Sample '));
console.log(samples.slice(-2).join('\n'));
console.log(JSON.stringify({freeMemoryMB:Math.round(os.freemem()/1048576),totalMemoryMB:Math.round(os.totalmem()/1048576),imageReady:fs.existsSync('render/output/protail-interior-reference.png')}));
