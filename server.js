/********************************************************************
 * @author:      Kaven
 * @email:       kaven@wuwenkai.com
 * @website:     http://api.kaven.xyz
 * @file:        [kaven-public-api] /server.js
 * @create:      2022-06-27 14:30:57.698
 * @modify:      2023-11-18 21:13:36.582
 * @version:     0.0.2
 * @times:       17
 * @lines:       52
 * @copyright:   Copyright © 2022-2023 Kaven. All Rights Reserved.
 * @description: [description]
 * @license:     [license]
 ********************************************************************/


import { FormatCurrentDate } from "kaven-basic";
import { LoadJsonConfig, HttpRequestParser } from "kaven-utils";
import { createServer } from "net";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = await LoadJsonConfig(__dirname);

const server = createServer(socket => {
    console.log("Client connected");

    const parser = new HttpRequestParser();

    // Handle data received from the client
    socket.on("data", (data) => {
        console.log(`Received data: ${data}`);
                
        parser.Add(data);
        const message = parser.TryGet();
        if (message) {
            console.info(message);
        }
    });

    // Handle client disconnection
    socket.on("end", () => {
        console.log("Client disconnected");
    });

    // Handle errors
    socket.on("error", (err) => {
        console.error(`Error: ${err.message}`);
    });
});

const host = config.host;
const port = config.port;

server.listen(port, host, () => {
    console.info(`server listening on http://${host}:${port}`);
});
