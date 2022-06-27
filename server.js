/********************************************************************
 * @author:      Kaven
 * @email:       kaven@wuwenkai.com
 * @website:     http://api.kaven.xyz
 * @file:        [Kaven-Public-API] /server.js
 * @create:      2022-06-27 14:30:57.698
 * @modify:      2022-06-27 14:40:41.336
 * @version:     0.0.2
 * @times:       6
 * @lines:       45
 * @copyright:   Copyright © 2022 Kaven. All Rights Reserved.
 * @description: [description]
 * @license:     [license]
 ********************************************************************/


// Require the framework and instantiate it
const { fastify } = require("fastify");

const app = fastify({
    trustProxy: true,
});

// Declare a route
app.get("/", async (request, reply) => {
    return request.ip;
});

// Run the server!
const start = async () => {

    const host = "0.0.0.0";
    const port = 3000;

    try {
        await app.listen({host, port});

        console.info(`server listening on http://localhost:${port}`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

start();