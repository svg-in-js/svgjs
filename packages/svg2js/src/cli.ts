import open from 'open';
import parser from 'yargs-parser';
import { Spinner, log, c } from '@all-in-js/utils';
import Svg2js, { FilesMap } from './index';
import pkg from '../package.json';

const CLI_NAME = 'svg2js';
const {
  _: [command],
  ...argvs
} = parser(
  process.argv.slice(2), {
    alias: {
      version: ['v'],
      help: ['h'],
      entry: ['e'],
      nameSep: ['sep'],
      spriteId: ['id'],
      outputFolder: ['o'],
    },
    configuration: {
      'short-option-groups': false,
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
  console.log(pkg.version);
}

/**
 * {CLI_NAME} b | build
 * or 
 * {CLI_NAME}
 */
function build(preview?: boolean) {
  const spin = new Spinner('start find and optimize your svg files.');
  const svg2js = new Svg2js(
    argvs.entry,
    {
      nameSep: argvs.nameSep,
      spriteId: argvs.spriteId,
      outputFolder: argvs.outputFolder
    }
  );
  let svgs: FilesMap = new Map();

  try {
    svgs = svg2js.optimizeSvg();
  } catch (e: any) {
    spin.stop();
    log.error(e.message);
    return;
  }

  const outputFile = svg2js[preview ? 'outputPreviewHtml' : 'outputSpriteJS']();

  spin.stop();

  log.info(`There are ${c.cyan(svgs.size)} svg files has found and optimized.`, CLI_NAME);
  log.info(`Output: ${outputFile}`, CLI_NAME);

  if (preview) {
    open(outputFile);
  }
}

function run() {
  if (argvs.help) {
    showHelp();
  } else if (argvs.version) {
    showVersion();
  } else {
    if ([undefined, 'b', 'build'].includes(command as string | undefined)) {
      build();
      log.info(`Please import this ${c.cyan('svg-sprite.js')} file in your project, then you can use it by filename.`, CLI_NAME);
      log.info(`If you dont remembered the filename, you can run '${CLI_NAME} preview [option]', find a svg and copy it.`);
    } else if (command === 'preview') {
      build(true);
      log.info('you can click the output file to preview and use your svg.', CLI_NAME);
    } else {
      console.log('the command only support build or preview.');
    }
  }
}

run();
