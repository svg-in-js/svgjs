export function createPreviewPage(svgSpriteRuntime, svgsData, compressPercentObj) {
  const pageHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Preview Svgs</title>
    </head>
    <body>
      <div id="app">
        <input placeholder="查询 svg" />
        <div class="svgs"></div>
      </div>
      <script>
        ${svgSpriteRuntime}
      </script>
      <script type="module">
        const svgsData = ${JSON.stringify(svgsData)};
        const compressPercentObj = ${JSON.stringify(compressPercentObj)};
        const svgItem = (filename, data, percent) => {
          return \`<div class="svg">
            <svg style="width: \${data.width}px; height: \${data.height}px"><use xlink:href="#\${filename}"></use></svg>
            <p>\${filename}</p>
            <p>压缩率: \${percent}%</p>
          </div>\`;
        }
    
        const searchSvg = keyword => {
          const svgs = {
            ...svgsData,
          };
          const results = [];
    
          for (const filename in svgs) {
            if (!keyword || (keyword && filename.includes(keyword))) {
              results.push(svgItem(filename, svgs[filename], compressPercentObj[filename]));
            }
          }
    
          return results;
        }
    
        document.querySelector('.svgs').innerHTML = searchSvg().join('');
      </script>
    </body>
    </html>
  `;

  return pageHtml;
}