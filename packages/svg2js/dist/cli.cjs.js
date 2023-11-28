#!/usr/bin/env node
'use strict';

var parser = require('yargs-parser');
var Svg2js = require('./index');
var utils = require('@all-in-js/utils');
var pkg = require('../package.json');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e["default"] : e; }

var parser__default = /*#__PURE__*/_interopDefaultLegacy(parser);
var Svg2js__default = /*#__PURE__*/_interopDefaultLegacy(Svg2js);
var pkg__default = /*#__PURE__*/_interopDefaultLegacy(pkg);

const CLI_NAME = 'svg2js';
const { _: [command], ...argvs } = parser__default(process.argv.slice(2), {
    alias: {
        version: ['v'],
        help: ['h'],
        entry: ['e'],
        nameSep: ['sep'],
        spriteId: ['id'],
        output: ['o'],
    },
});
/**
 * {CLI_NAME} --entry src/asset/svg --output src/js/svg-sprite
 * or
 * {CLI_NAME} -e src/asset/svg --o src/js/svg-sprite
 */
const helpText = `
Usage: ${CLI_NAME} [command] [options]

  Commands:

    build, s         Build your svg files
    preview          Output a page for preview svg
    help, h          Output usage information

  Options:

    -v, --version    Output the version number
    -e, --entry      The folder of your svg files
    -o, --output     The folder for output files
    -h, --help       Output usage information
    -sep, --nameSep  Delimiters for file names
    -id, --spriteId  The svgSprite file's DOM id
`;
/**
 * {CLI_NAME} help | h
 * or
 * {CLI_NAME} --help | --h
 */
function showHelp() {
    console.log(helpText);
}
/**
 * {CLI_NAME} --version | --v
 */
function showVersion() {
    console.log(pkg__default.version);
}
/**
 * {CLI_NAME} b | build
 * or
 * {CLI_NAME}
 */
function build() {
    const spin = new utils.Spinner('');
    spin.step('start find and optimize your svg files.');
    const svg2js = new Svg2js__default(argvs.entry, {
        nameSep: argvs.nameSep,
        spriteId: argvs.spriteId
    });
    let svgs = new Map();
    try {
        svgs = svg2js.optimizeSvg();
    }
    catch (e) {
        spin.stop();
        utils.log.error(e.message);
        return;
    }
    const outputFile = svg2js.outputSpriteJS();
    spin.stop();
    utils.log.info(`There are ${utils.c.cyan(svgs.size)} svg files has found and optimized.`, CLI_NAME);
    utils.log.info(`Output: ${outputFile}`, CLI_NAME);
    utils.log.info(`Please import this svg-sprite file in your project, then you can use it by filename.`, CLI_NAME);
    utils.log.info(`If you dont remembered the filename, you can run '${CLI_NAME} preview [option]', find a svg and copy it.`);
}
function run() {
    if (argvs.help) {
        showHelp();
    }
    else if (argvs.version) {
        showVersion();
    }
    else {
        if ([undefined, 'b', 'build'].includes(command)) {
            build();
        }
        else if (command === 'preview') ;
        else {
            console.log('the command only support build or preview.');
        }
    }
}
run();
