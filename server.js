/********************************************************************
 * @author:      Kaven
 * @email:       kaven@wuwenkai.com
 * @website:     http://api.kaven.xyz
 * @file:        [kaven-public-api] /server.js
 * @create:      2022-06-27 14:30:57.698
 * @modify:      2024-08-28 13:52:46.164
 * @version:     0.0.2
 * @times:       31
 * @lines:       119
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
const signature = Buffer.from([52, 84, 135, 101, 239, 81]);

const KavenPacketType = {
    Error : -1,

    Unspecific : 0,

    SignatureOK : 1,

    RequestExternalIP : 101,
    RequestExternalIPOK : 102,
};

const server = createServer(socket => {
    const parser = new HttpRequestParser();    
    const logs = [];

    let isHttp = true;

    // Handle data received from the client
    socket.on("data", (data) => {
        if (isHttp) {
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
            } else {
                isHttp = false;

                if (data.subarray(0, signature.length).equals(signature)) {
                    const buffer = Buffer.alloc(8);
                    buffer.writeInt32LE(8, 0);
                    buffer.writeInt32LE(KavenPacketType.SignatureOK, 4);
                    socket.write(buffer);
                } else {
                    throw new Error();
                }
            }
        } else {
            const size = data.readInt32LE(0);
            const type = data.readInt32LE(4);

            if (size === 8 && type === KavenPacketType.RequestExternalIP) {
                const ip = Buffer.from(socket.remoteAddress, "utf-8");
                const buffer = Buffer.alloc(8);
                buffer.writeInt32LE(8 + ip.length, 0);
                buffer.writeInt32LE(KavenPacketType.RequestExternalIPOK, 4);
                socket.write(Buffer.concat([buffer, ip]));
            }
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
    KavenLogger.Default.Info(`server listening on http://${host}:${port}`);
});
