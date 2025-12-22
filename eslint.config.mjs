/********************************************************************
 * @author:      Kaven
 * @email:       kaven@wuwenkai.com
 * @website:     http://api.kaven.xyz
 * @file:        [kaven-public-api] /eslint.config.mjs
 * @create:      2022-06-27 14:22:02.898
 * @modify:      2025-12-22 15:47:27.235
 * @version:     1.0.1
 * @times:       8
 * @lines:       28
 * @copyright:   Copyright © 2022-2025 Kaven. All Rights Reserved.
 * @description: [description]
 * @license:     [license]
 ********************************************************************/

import config, { globals, nodeConfig } from "@wenkai.wu/eslint-config";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: [
            "server.js",
        ],
        extends: [config, nodeConfig],
        languageOptions: { globals: { ...globals.node } },
    },
]);
