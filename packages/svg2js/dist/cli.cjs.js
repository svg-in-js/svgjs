#!/usr/bin/env node
'use strict';

var process$1 = require('node:process');
var node_buffer = require('node:buffer');
var path = require('node:path');
var node_url = require('node:url');
var childProcess = require('node:child_process');
var fs$1 = require('node:fs/promises');
var os = require('node:os');
var fs = require('node:fs');
var node_util = require('node:util');
var parser = require('yargs-parser');
var utils = require('@all-in-js/utils');
var Svg2js = require('./index');
var pkg = require('../package.json');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e["default"] : e; }

var process__default = /*#__PURE__*/_interopDefaultLegacy(process$1);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var childProcess__default = /*#__PURE__*/_interopDefaultLegacy(childProcess);
var fs__default$1 = /*#__PURE__*/_interopDefaultLegacy(fs$1);
var os__default = /*#__PURE__*/_interopDefaultLegacy(os);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var parser__default = /*#__PURE__*/_interopDefaultLegacy(parser);
var Svg2js__default = /*#__PURE__*/_interopDefaultLegacy(Svg2js);
var pkg__default = /*#__PURE__*/_interopDefaultLegacy(pkg);

let isDockerCached;

function hasDockerEnv() {
	try {
		fs__default.statSync('/.dockerenv');
		return true;
	} catch {
		return false;
	}
}

function hasDockerCGroup() {
	try {
		return fs__default.readFileSync('/proc/self/cgroup', 'utf8').includes('docker');
	} catch {
		return false;
	}
}

function isDocker() {
	// TODO: Use `??=` when targeting Node.js 16.
	if (isDockerCached === undefined) {
		isDockerCached = hasDockerEnv() || hasDockerCGroup();
	}

	return isDockerCached;
}

let cachedResult;

// Podman detection
const hasContainerEnv = () => {
	try {
		fs__default.statSync('/run/.containerenv');
		return true;
	} catch {
		return false;
	}
};

function isInsideContainer() {
	// TODO: Use `??=` when targeting Node.js 16.
	if (cachedResult === undefined) {
		cachedResult = hasContainerEnv() || isDocker();
	}

	return cachedResult;
}

const isWsl = () => {
	if (process__default.platform !== 'linux') {
		return false;
	}

	if (os__default.release().toLowerCase().includes('microsoft')) {
		if (isInsideContainer()) {
			return false;
		}

		return true;
	}

	try {
		return fs__default.readFileSync('/proc/version', 'utf8').toLowerCase().includes('microsoft')
			? !isInsideContainer() : false;
	} catch {
		return false;
	}
};

var isWsl$1 = process__default.env.__IS_WSL_TEST__ ? isWsl : isWsl();

function defineLazyProperty(object, propertyName, valueGetter) {
	const define = value => Object.defineProperty(object, propertyName, {value, enumerable: true, writable: true});

	Object.defineProperty(object, propertyName, {
		configurable: true,
		enumerable: true,
		get() {
			const result = valueGetter();
			define(result);
			return result;
		},
		set(value) {
			define(value);
		}
	});

	return object;
}

const execFileAsync$3 = node_util.promisify(childProcess.execFile);

async function defaultBrowserId() {
	if (process__default.platform !== 'darwin') {
		throw new Error('macOS only');
	}

	const {stdout} = await execFileAsync$3('defaults', ['read', 'com.apple.LaunchServices/com.apple.launchservices.secure', 'LSHandlers']);

	// `(?!-)` is to prevent matching `LSHandlerRoleAll = "-";`.
	const match = /LSHandlerRoleAll = "(?!-)(?<id>[^"]+?)";\s+?LSHandlerURLScheme = (?:http|https);/.exec(stdout);

	return match?.groups.id ?? 'com.apple.Safari';
}

const execFileAsync$2 = node_util.promisify(childProcess.execFile);

async function runAppleScript(script, {humanReadableOutput = true} = {}) {
	if (process__default.platform !== 'darwin') {
		throw new Error('macOS only');
	}

	const outputArguments = humanReadableOutput ? [] : ['-ss'];

	const {stdout} = await execFileAsync$2('osascript', ['-e', script, outputArguments]);
	return stdout.trim();
}

async function bundleName(bundleId) {
	return runAppleScript(`tell application "Finder" to set app_path to application file id "${bundleId}" as string\ntell application "System Events" to get value of property list item "CFBundleName" of property list file (app_path & ":Contents:Info.plist")`);
}

const execFileAsync$1 = node_util.promisify(childProcess.execFile);

// Windows doesn't have browser IDs in the same way macOS/Linux does so we give fake
// ones that look real and match the macOS/Linux versions for cross-platform apps.
const windowsBrowserProgIds = {
	AppXq0fevzme2pys62n3e0fbqa7peapykr8v: {name: 'Edge', id: 'com.microsoft.edge.old'},
	MSEdgeDHTML: {name: 'Edge', id: 'com.microsoft.edge'}, // On macOS, it's "com.microsoft.edgemac"
	MSEdgeHTM: {name: 'Edge', id: 'com.microsoft.edge'}, // Newer Edge/Win10 releases
	'IE.HTTP': {name: 'Internet Explorer', id: 'com.microsoft.ie'},
	FirefoxURL: {name: 'Firefox', id: 'org.mozilla.firefox'},
	ChromeHTML: {name: 'Chrome', id: 'com.google.chrome'},
	BraveHTML: {name: 'Brave', id: 'com.brave.Browser'},
	BraveBHTML: {name: 'Brave Beta', id: 'com.brave.Browser.beta'},
	BraveSSHTM: {name: 'Brave Nightly', id: 'com.brave.Browser.nightly'},
};

class UnknownBrowserError extends Error {}

async function defaultBrowser$1(_execFileAsync = execFileAsync$1) {
	const {stdout} = await _execFileAsync('reg', [
		'QUERY',
		' HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\Shell\\Associations\\UrlAssociations\\http\\UserChoice',
		'/v',
		'ProgId',
	]);

	const match = /ProgId\s*REG_SZ\s*(?<id>\S+)/.exec(stdout);
	if (!match) {
		throw new UnknownBrowserError(`Cannot find Windows browser in stdout: ${JSON.stringify(stdout)}`);
	}

	const {id} = match.groups;

	const browser = windowsBrowserProgIds[id];
	if (!browser) {
		throw new UnknownBrowserError(`Unknown browser ID: ${id}`);
	}

	return browser;
}

const execFileAsync = node_util.promisify(childProcess.execFile);

// Inlined: https://github.com/sindresorhus/titleize/blob/main/index.js
const titleize = string => string.toLowerCase().replaceAll(/(?:^|\s|-)\S/g, x => x.toUpperCase());

async function defaultBrowser() {
	if (process__default.platform === 'darwin') {
		const id = await defaultBrowserId();
		const name = await bundleName(id);
		return {name, id};
	}

	if (process__default.platform === 'linux') {
		const {stdout} = await execFileAsync('xdg-mime', ['query', 'default', 'x-scheme-handler/http']);
		const id = stdout.trim();
		const name = titleize(id.replace(/.desktop$/, '').replace('-', ' '));
		return {name, id};
	}

	if (process__default.platform === 'win32') {
		return defaultBrowser$1();
	}

	throw new Error('Only macOS, Linux, and Windows are supported');
}

// Path to included `xdg-open`.
const __dirname$1 = path__default.dirname(node_url.fileURLToPath((typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : (document.currentScript && document.currentScript.src || new URL('cli.cjs.js', document.baseURI).href))));
const localXdgOpenPath = path__default.join(__dirname$1, 'xdg-open');

const {platform, arch} = process__default;

/**
Get the mount point for fixed drives in WSL.

@inner
@returns {string} The mount point.
*/
const getWslDrivesMountPoint = (() => {
	// Default value for "root" param
	// according to https://docs.microsoft.com/en-us/windows/wsl/wsl-config
	const defaultMountPoint = '/mnt/';

	let mountPoint;

	return async function () {
		if (mountPoint) {
			// Return memoized mount point value
			return mountPoint;
		}

		const configFilePath = '/etc/wsl.conf';

		let isConfigFileExists = false;
		try {
			await fs__default$1.access(configFilePath, fs$1.constants.F_OK);
			isConfigFileExists = true;
		} catch {}

		if (!isConfigFileExists) {
			return defaultMountPoint;
		}

		const configContent = await fs__default$1.readFile(configFilePath, {encoding: 'utf8'});
		const configMountPoint = /(?<!#.*)root\s*=\s*(?<mountPoint>.*)/g.exec(configContent);

		if (!configMountPoint) {
			return defaultMountPoint;
		}

		mountPoint = configMountPoint.groups.mountPoint.trim();
		mountPoint = mountPoint.endsWith('/') ? mountPoint : `${mountPoint}/`;

		return mountPoint;
	};
})();

const pTryEach = async (array, mapper) => {
	let latestError;

	for (const item of array) {
		try {
			return await mapper(item); // eslint-disable-line no-await-in-loop
		} catch (error) {
			latestError = error;
		}
	}

	throw latestError;
};

const baseOpen = async options => {
	options = {
		wait: false,
		background: false,
		newInstance: false,
		allowNonzeroExitCode: false,
		...options,
	};

	if (Array.isArray(options.app)) {
		return pTryEach(options.app, singleApp => baseOpen({
			...options,
			app: singleApp,
		}));
	}

	let {name: app, arguments: appArguments = []} = options.app ?? {};
	appArguments = [...appArguments];

	if (Array.isArray(app)) {
		return pTryEach(app, appName => baseOpen({
			...options,
			app: {
				name: appName,
				arguments: appArguments,
			},
		}));
	}

	if (app === 'browser' || app === 'browserPrivate') {
		// IDs from default-browser for macOS and windows are the same
		const ids = {
			'com.google.chrome': 'chrome',
			'google-chrome.desktop': 'chrome',
			'org.mozilla.firefox': 'firefox',
			'firefox.desktop': 'firefox',
			'com.microsoft.msedge': 'edge',
			'com.microsoft.edge': 'edge',
			'microsoft-edge.desktop': 'edge',
		};

		// Incognito flags for each browser in `apps`.
		const flags = {
			chrome: '--incognito',
			firefox: '--private-window',
			edge: '--inPrivate',
		};

		const browser = await defaultBrowser();
		if (browser.id in ids) {
			const browserName = ids[browser.id];

			if (app === 'browserPrivate') {
				appArguments.push(flags[browserName]);
			}

			return baseOpen({
				...options,
				app: {
					name: apps[browserName],
					arguments: appArguments,
				},
			});
		}

		throw new Error(`${browser.name} is not supported as a default browser`);
	}

	let command;
	const cliArguments = [];
	const childProcessOptions = {};

	if (platform === 'darwin') {
		command = 'open';

		if (options.wait) {
			cliArguments.push('--wait-apps');
		}

		if (options.background) {
			cliArguments.push('--background');
		}

		if (options.newInstance) {
			cliArguments.push('--new');
		}

		if (app) {
			cliArguments.push('-a', app);
		}
	} else if (platform === 'win32' || (isWsl$1 && !isInsideContainer() && !app)) {
		const mountPoint = await getWslDrivesMountPoint();

		command = isWsl$1
			? `${mountPoint}c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe`
			: `${process__default.env.SYSTEMROOT || process__default.env.windir || 'C:\\Windows'}\\System32\\WindowsPowerShell\\v1.0\\powershell`;

		cliArguments.push(
			'-NoProfile',
			'-NonInteractive',
			'-ExecutionPolicy',
			'Bypass',
			'-EncodedCommand',
		);

		if (!isWsl$1) {
			childProcessOptions.windowsVerbatimArguments = true;
		}

		const encodedArguments = ['Start'];

		if (options.wait) {
			encodedArguments.push('-Wait');
		}

		if (app) {
			// Double quote with double quotes to ensure the inner quotes are passed through.
			// Inner quotes are delimited for PowerShell interpretation with backticks.
			encodedArguments.push(`"\`"${app}\`""`);
			if (options.target) {
				appArguments.push(options.target);
			}
		} else if (options.target) {
			encodedArguments.push(`"${options.target}"`);
		}

		if (appArguments.length > 0) {
			appArguments = appArguments.map(argument => `"\`"${argument}\`""`);
			encodedArguments.push('-ArgumentList', appArguments.join(','));
		}

		// Using Base64-encoded command, accepted by PowerShell, to allow special characters.
		options.target = node_buffer.Buffer.from(encodedArguments.join(' '), 'utf16le').toString('base64');
	} else {
		if (app) {
			command = app;
		} else {
			// When bundled by Webpack, there's no actual package file path and no local `xdg-open`.
			const isBundled = !__dirname$1 || __dirname$1 === '/';

			// Check if local `xdg-open` exists and is executable.
			let exeLocalXdgOpen = false;
			try {
				await fs__default$1.access(localXdgOpenPath, fs$1.constants.X_OK);
				exeLocalXdgOpen = true;
			} catch {}

			const useSystemXdgOpen = process__default.versions.electron
				?? (platform === 'android' || isBundled || !exeLocalXdgOpen);
			command = useSystemXdgOpen ? 'xdg-open' : localXdgOpenPath;
		}

		if (appArguments.length > 0) {
			cliArguments.push(...appArguments);
		}

		if (!options.wait) {
			// `xdg-open` will block the process unless stdio is ignored
			// and it's detached from the parent even if it's unref'd.
			childProcessOptions.stdio = 'ignore';
			childProcessOptions.detached = true;
		}
	}

	if (platform === 'darwin' && appArguments.length > 0) {
		cliArguments.push('--args', ...appArguments);
	}

	// This has to come after `--args`.
	if (options.target) {
		cliArguments.push(options.target);
	}

	const subprocess = childProcess__default.spawn(command, cliArguments, childProcessOptions);

	if (options.wait) {
		return new Promise((resolve, reject) => {
			subprocess.once('error', reject);

			subprocess.once('close', exitCode => {
				if (!options.allowNonzeroExitCode && exitCode > 0) {
					reject(new Error(`Exited with code ${exitCode}`));
					return;
				}

				resolve(subprocess);
			});
		});
	}

	subprocess.unref();

	return subprocess;
};

const open = (target, options) => {
	if (typeof target !== 'string') {
		throw new TypeError('Expected a `target`');
	}

	return baseOpen({
		...options,
		target,
	});
};

function detectArchBinary(binary) {
	if (typeof binary === 'string' || Array.isArray(binary)) {
		return binary;
	}

	const {[arch]: archBinary} = binary;

	if (!archBinary) {
		throw new Error(`${arch} is not supported`);
	}

	return archBinary;
}

function detectPlatformBinary({[platform]: platformBinary}, {wsl}) {
	if (wsl && isWsl$1) {
		return detectArchBinary(wsl);
	}

	if (!platformBinary) {
		throw new Error(`${platform} is not supported`);
	}

	return detectArchBinary(platformBinary);
}

const apps = {};

defineLazyProperty(apps, 'chrome', () => detectPlatformBinary({
	darwin: 'google chrome',
	win32: 'chrome',
	linux: ['google-chrome', 'google-chrome-stable', 'chromium'],
}, {
	wsl: {
		ia32: '/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe',
		x64: ['/mnt/c/Program Files/Google/Chrome/Application/chrome.exe', '/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe'],
	},
}));

defineLazyProperty(apps, 'firefox', () => detectPlatformBinary({
	darwin: 'firefox',
	win32: 'C:\\Program Files\\Mozilla Firefox\\firefox.exe',
	linux: 'firefox',
}, {
	wsl: '/mnt/c/Program Files/Mozilla Firefox/firefox.exe',
}));

defineLazyProperty(apps, 'edge', () => detectPlatformBinary({
	darwin: 'microsoft edge',
	win32: 'msedge',
	linux: ['microsoft-edge', 'microsoft-edge-dev'],
}, {
	wsl: '/mnt/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
}));

defineLazyProperty(apps, 'browser', () => 'browser');

defineLazyProperty(apps, 'browserPrivate', () => 'browserPrivate');

var open$1 = open;

const CLI_NAME = 'svg2js';
const { _: [command], ...argvs } = parser__default(process.argv.slice(2), {
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
    console.log(pkg__default.version);
}
/**
 * {CLI_NAME} b | build
 * or
 * {CLI_NAME}
 */
function build(preview) {
    const spin = new utils.Spinner('start find and optimize your svg files.');
    const svg2js = new Svg2js__default(argvs.entry, {
        nameSep: argvs.nameSep,
        spriteId: argvs.spriteId,
        outputFolder: argvs.outputFolder
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
    const outputFile = svg2js[preview ? 'outputPreviewHtml' : 'outputSpriteJS']();
    spin.stop();
    utils.log.info(`There are ${utils.c.cyan(svgs.size)} svg files has found and optimized.`, CLI_NAME);
    utils.log.info(`Output: ${outputFile}`, CLI_NAME);
    if (preview) {
        open$1(outputFile);
    }
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
            utils.log.info(`Please import this ${utils.c.cyan('svg-sprite.js')} file in your project, then you can use it by filename.`, CLI_NAME);
            utils.log.info(`If you dont remembered the filename, you can run '${CLI_NAME} preview [option]', find a svg and copy it.`);
        }
        else if (command === 'preview') {
            build(true);
            utils.log.info('you can click the output file to preview and use your svg.', CLI_NAME);
        }
        else {
            console.log('the command only support build or preview.');
        }
    }
}
run();
