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


import { FileSize } from "kaven-basic";
import { HttpRequestParser, HttpResponseBody, HttpResponseMessage, HttpResponseStatusLine, KavenLogger, LoadJsonConfig } from "kaven-utils";
import { createServer } from "net";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = await LoadJsonConfig(__dirname);

const server = createServer(socket => {
    const parser = new HttpRequestParser();

    const logs = [];

    // Handle data received from the client
    socket.on("data", (data) => {
        parser.Add(data);
        const request = parser.TryGet();
        if (request) {
            const response = new HttpResponseMessage();
            response.StatusLine = new HttpResponseStatusLine(200);
            response.Body = new HttpResponseBody(Buffer.from(socket.remoteAddress ?? ""));

            socket.end(response.ToBuffer());

            logs.push(...[
                `${request.StartLine.Method} ${request.StartLine.RequestTarget.OriginalUrl}`,
            ]);
        }
    });

    // Handle client disconnection
    socket.on("end", () => {
        KavenLogger.Default.Info(`${logs.join(", ")}, ip: ${socket.remoteAddress}, read: ${FileSize(socket.bytesRead)}, write: ${FileSize(socket.bytesWritten)}`);
    });

    // Handle errors
    socket.on("error", (err) => {
        KavenLogger.Default.Error(`Error: ${err.message}`);
    });
});

const host = config.host;
const port = config.port;

server.listen(port, host, () => {
    console.info(`server listening on http://${host}:${port}`);
});
