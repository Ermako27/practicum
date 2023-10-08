import http from "http";
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mathFunction } from "./mathFunction.js";
const server = http.createServer(function (req, res) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const filePath = join(__dirname, 'war-and-peace.txt');
    const reader = fs.createReadStream(filePath, { encoding: 'utf8' });
    debugger;
    const mathResult = mathFunction(5);
    console.log(mathResult);
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    });
    reader.pipe(res);
});
server.listen(3000);
