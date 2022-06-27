/********************************************************************
 * @author:      Kaven
 * @email:       kaven@wuwenkai.com
 * @website:     http://api.kaven.xyz
 * @file:        [Kaven-Public-API] /.eslintrc.js
 * @create:      2022-06-27 14:22:02.898
 * @modify:      2022-06-27 14:22:02.898
 * @version:     0.0.2
 * @times:       1
 * @lines:       16
 * @copyright:   Copyright © 2022 Kaven. All Rights Reserved.
 * @description: [description]
 * @license:     [license]
 ********************************************************************/

module.exports = {
    env: {
        commonjs: true,
        es2021: true,
        node: true,
    },
    extends: [
        "eslint:recommended",
        "@wenkai.wu/eslint-config",
    ],
    parserOptions: {
        ecmaVersion: 13,
    },
    rules: {
    },
};