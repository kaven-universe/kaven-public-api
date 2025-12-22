/********************************************************************
 * @author:      Kaven
 * @email:       kaven@wuwenkai.com
 * @website:     http://api.kaven.xyz
 * @file:        [kaven-public-api] /server.js
 * @create:      2022-06-27 14:30:57.698
 * @modify:      2025-12-22 16:40:13.798
 * @version:     1.0.1
 * @times:       52
 * @lines:       196
 * @copyright:   Copyright © 2022-2025 Kaven. All Rights Reserved.
 * @description: [description]
 * @license:     [license]
 ********************************************************************/

import { CombinePath, ConsoleLogger, HttpRequestHeader_XForwardedFor, IsEqual, IsPrivateIP, IsPublicIP, LoggingAgent, ToFileSize } from "kaven-basic";
import { HttpRequestParser, HttpResponseBody, HttpResponseHeader, HttpResponseMessage, HttpResponseStatusLine, LoadJsonConfig, TryParseVersionFromFile } from "kaven-utils";
import { createServer } from "node:net";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logger = new LoggingAgent(new ConsoleLogger(true));

const config = await LoadJsonConfig(logger, __dirname);
const signature = Buffer.from([52, 84, 135, 101, 239, 81]);

const KavenPacketType = {
    Error: -1,
    Unspecific: 0,
    SignatureOK: 1,

    Initialize: 91,
    InitializeOK: 92,

    RequestExternalIP: 101,
    RequestExternalIPOK: 102,
};

const SERVER_VERSION = (await TryParseVersionFromFile(CombinePath(__dirname, "package.json")))?.version ?? "N/A";

/**
 * @param { KavenPacketType } v 
 */
const GetMessageName = (v) => {
    for (const key in KavenPacketType) {
        if (KavenPacketType[key] === v) {
            return key;
        }
    }

    return "Unknown";
};

const server = createServer(socket => {
    const parser = new HttpRequestParser();
    let isHttp = true;
    let ip = socket.remoteAddress;

    const log = (text) => {
        logger.Info(`[${socket.remoteAddress}][${ip}] ${text}`);
    };

    const logError = (text) => {
        logger.Error(`[${socket.remoteAddress}][${ip}] ${text}`);
    };

    /**
     * @param { KavenPacketType } type 
     * @param { Buffer | string } data
     */
    const sendMessage = (type, data) => {
        if (typeof data === "string") {
            data = Buffer.from(data, "utf-8");
        }

        const dataLength = data ? data.length : 0;

        const buffer = Buffer.alloc(8);
        buffer.writeInt32LE(8 + dataLength, 0);
        buffer.writeInt32LE(type, 4);

        socket.write(buffer);
        if (data) {
            socket.write(data);
        }

        log(`Send ${GetMessageName(type)}, data size: (${dataLength} bytes)`);
    };

    // Handle data received from the client
    socket.on("data", (data) => {
        try {
            log(`data received(${data.length} bytes): ${data.subarray(0, 8).join(",")} ...`);

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

                    ip = ips.find(IsPublicIP) ?? ips.find(IsPrivateIP) ?? ips.find(p => !!p) ?? "";

                    const signatureHeader = request.Headers.find(p => IsEqual(p.Name, "Kaven-Signature", true));
                    if (signatureHeader) {
                        if (signatureHeader.Value !== "34548765EF51") {
                            logError(`Invalid signature header value: ${signatureHeader.Value}`);
                        }

                        isHttp = false;
                        sendMessage(KavenPacketType.SignatureOK);
                    } else {
                        const response = new HttpResponseMessage();
                        response.StatusLine = new HttpResponseStatusLine(200);
                        response.Body = new HttpResponseBody(Buffer.from(ip));

                        response.Headers.push(new HttpResponseHeader("Date", new Date().toUTCString()));
                        response.Headers.push(new HttpResponseHeader("Server", `kaven-public-api/${SERVER_VERSION}`));
                        response.Headers.push(new HttpResponseHeader("Content-Type", "text/plain; charset=utf-8"));
                        response.Headers.push(new HttpResponseHeader("Content-Length", response.Body.Data.length.toString()));

                        socket.write(response.ToBuffer());

                        log(`${request.StartLine.Method} ${request.StartLine.RequestTarget.OriginalUrl}, ip:${ip}`);
                    }
                } else {
                    isHttp = false;
                    log("HTTP parse failed");

                    if (data.subarray(0, signature.length).equals(signature)) {
                        sendMessage(KavenPacketType.SignatureOK);
                    } else {
                        log("Unrecognized signature");
                        socket.end();
                    }
                }
            } else {
                const size = data.readInt32LE(0);
                const type = data.readInt32LE(4);

                log(`Receive ${GetMessageName(type)}, data size: (${size - 8} bytes)`);

                switch (type) {
                    case KavenPacketType.Initialize:
                        {
                            // TODO: process initialization data if needed
                            sendMessage(KavenPacketType.InitializeOK);
                        }
                        break;
                    case KavenPacketType.RequestExternalIP:
                        {
                            sendMessage(KavenPacketType.RequestExternalIPOK, socket.remoteAddress);
                        }
                        break;

                    default: {
                        sendMessage(KavenPacketType.Error, `Unrecognized message type: ${type}`);
                    }
                }
            }
        } catch (ex) {
            logError(ex.message);
        }
    });

    // Handle client disconnection
    socket.on("end", () => {
        log(`read ${ToFileSize(socket.bytesRead)}, write ${ToFileSize(socket.bytesWritten)}`);
    });

    // Handle errors
    socket.on("error", (err) => {
        logError(`Error: ${err.message}`);
        log(`read ${ToFileSize(socket.bytesRead)}, write ${ToFileSize(socket.bytesWritten)}`);
    });
});

const host = config.host;
const port = config.port;

server.listen(port, host, () => {
    logger.Info(`server listening on http://${host}:${port}, version: ${SERVER_VERSION}`);
});
