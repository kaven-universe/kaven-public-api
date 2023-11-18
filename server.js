/********************************************************************
 * @author:      Kaven
 * @email:       kaven@wuwenkai.com
 * @website:     http://api.kaven.xyz
 * @file:        [kaven-public-api] /server.js
 * @create:      2022-06-27 14:30:57.698
 * @modify:      2023-11-18 20:57:51.062
 * @version:     0.0.2
 * @times:       16
 * @lines:       52
 * @copyright:   Copyright © 2022-2023 Kaven. All Rights Reserved.
 * @description: [description]
 * @license:     [license]
 ********************************************************************/


import { fastify } from "fastify";
import { FormatCurrentDate } from "kaven-basic";
import { LoadJsonConfig } from "kaven-utils";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = await LoadJsonConfig(__dirname, "./config.json");

const app = fastify({
    trustProxy: true,
});

app.get("/", async (request, reply) => {
    console.info(`[${FormatCurrentDate()}] ${request.ip}`);
    return request.ip;
});

app.get("*", (request, reply) => {
    reply.code(400).send("Bad Request");
});

try {
    const host = config.host;
    const port = config.port;

    await app.listen({ host, port });

    console.info(`server listening on http://${host}:${port}`);
} catch (err) {
    console.error(err);
    process.exit(1);
}
