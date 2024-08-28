/********************************************************************
 * @author:      Kaven
 * @email:       kaven@wuwenkai.com
 * @website:     http://api.kaven.xyz
 * @file:        [kaven-public-api] /server.js
 * @create:      2022-06-27 14:30:57.698
 * @modify:      2024-08-28 10:48:50.147
 * @version:     0.0.2
 * @times:       21
 * @lines:       82
 * @copyright:   Copyright © 2022-2024 Kaven. All Rights Reserved.
 * @description: [description]
 * @license:     [license]
 ********************************************************************/


import { FileSize, HttpRequestHeader_XForwardedFor, IsEqual, IsPrivateIP, IsPublicIP } from "kaven-basic";
import { HttpRequestParser, HttpResponseBody, HttpResponseMessage, HttpResponseStatusLine, KavenLogger, LoadJsonConfig } from "kaven-utils";
import { createServer } from "node:net";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

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
            const ips = [socket.remoteAddress];

            let header = request.Headers.find(p => IsEqual(p.Name, "X-Real-IP", true));
            if (header) {
                ips.push(header.Value);
            }

            header = request.Headers.find(p => IsEqual(p.Name, HttpRequestHeader_XForwardedFor, true));
            if (header) {
                ips.push(header.Value.split(",")[0]);
            }

            const ip = ips.find(IsPublicIP) ?? ips.find(IsPrivateIP) ?? ips.find(p => !!p) ?? "";

            const response = new HttpResponseMessage();
            response.StatusLine = new HttpResponseStatusLine(200);
            response.Body = new HttpResponseBody(Buffer.from(ip));

            socket.end(response.ToBuffer());

            logs.push(...[
                `${request.StartLine.Method} ${request.StartLine.RequestTarget.OriginalUrl}`,
                `ip:${ip}`,
            ]);
        }
    });

    // Handle client disconnection
    socket.on("end", () => {
        KavenLogger.Default.Info(` ${logs.join(", ")}, read:${FileSize(socket.bytesRead)},write: ${FileSize(socket.bytesWritten)}`);
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
