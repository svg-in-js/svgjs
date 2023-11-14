import { fse, log, resolveCWD } from '@all-in-js/utils';
import { globSync } from 'glob';
import { optimize } from 'svgo';

const entryDir = 'src/assets';
const filenameSep = '/';
const compressPercentMap = new Map();

function deepFindSvg() {
  if (!entryDir) {
    return log.error('please set an entry dir.');
  }

  let target = resolveCWD(entryDir);

  if (!fse.existsSync(target)) {
    return log.error('please set an exists entry dir.');
  }

  const files = globSync(`${entryDir}/**/*.svg`);

  return files || [];
}


const svgs = deepFindSvg();

function optimizeSvgs(svgFiles) {
  if (!svgFiles?.length) return [];

  const filesMap = new Map();

  svgFiles.forEach(svgFilePath => {
    const svgStr = fse.readFileSync(resolveCWD(svgFilePath)).toString();
    const filename = svgFilePath.replace(`${entryDir}/`, '');
    const buildSvg = optimize(svgStr, {
      multipass: true,
    });
    const compressPercent = Math.round((1 - buildSvg.data.length / svgStr.length) * 100);

    compressPercentMap.set(filename, compressPercent);
    filesMap.set(filename, buildSvg);
  });

  return filesMap;
}

console.log(svgs);
optimizeSvgs(svgs);
console.log(compressPercentMap);

// 增、删、改