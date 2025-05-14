/********************************************************************
 * @author:      Kaven
 * @email:       kaven@wuwenkai.com
 * @website:     http://api.kaven.xyz
 * @file:        [kaven-public-api] /eslint.config.mjs
 * @create:      2022-06-27 14:22:02.898
 * @modify:      2025-05-14 16:56:27.314
 * @version:     1.0.1
 * @times:       4
 * @lines:       24
 * @copyright:   Copyright © 2022-2025 Kaven. All Rights Reserved.
 * @description: [description]
 * @license:     [license]
 ********************************************************************/

import configs, { globals } from "@wenkai.wu/eslint-config";

export default [
    ...configs,
    {
        languageOptions: { globals: { ...globals.node } },
    },
];
