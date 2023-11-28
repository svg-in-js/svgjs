const fs = require('fs-extra');
const path = require('path');
const execa = require('execa');
const chalk = require('chalk');
const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor');

build();

async function build() {
  await execa('rollup', ['-c'], {stdio: 'inherit'});

  await createApiExtractor();

  rewriteCli();
}

function rewriteCli() {
  const filePath = path.resolve(__dirname, 'dist/cli.cjs.js');
  const str = fs.readFileSync(filePath).toString();

  fs.writeFileSync(filePath, `#!/usr/bin/env node
${str}`);
}

async function createApiExtractor() {
  const extractorConfigPath = path.resolve(process.cwd(), `api-extractor.json`)
  const extractorConfig = ExtractorConfig.loadFileAndPrepare(
    extractorConfigPath
  )
  const extractorResult = Extractor.invoke(extractorConfig, {
    localBuild: true,
    showVerboseMessages: true
  })

  if (extractorResult.succeeded) {
    console.log(
      chalk.bold(chalk.green(`API Extractor completed successfully.`))
    )
  } else {
    console.error(
      `API Extractor completed with ${extractorResult.errorCount} errors` +
        ` and ${extractorResult.warningCount} warnings`
    )
    process.exitCode = 1
  }

  await fs.remove(path.resolve(process.cwd(), `./dist/src`))
}
