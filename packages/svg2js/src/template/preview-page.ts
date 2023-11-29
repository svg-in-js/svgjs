export function createPreviewPage(svgSpriteRuntime: string, svgsData: object, compressPercentObj: object): string {
  const pageHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Preview Svgs</title>
      <style>
      html,body,#app {
        height: 100%;
      }
      body {
        overflow: hidden;
        font-size: 12px;
        color: #4b4848;
      }
      #app {
        display: flex;
        flex-direction: column;
      }
      input {
        width: 170px;
        margin-bottom: 10px;
      }
      .main-content {
        flex: 1;
        overflow: auto;
      }
      .svg {
        display: inline-block;
        font-size: 12px;
        text-align: left;
        margin-right: 15px;
        margin-bottom: 15px;
        cursor: pointer;
      }
      </style>
    </head>
    <body>
      <div id="app">
        <div class="top-bar">
          <input placeholder="查询 svg" />
          <span>共 <b class="total"></b> 个</span>
        </div>
        <div class="main-content">
          <div class="svgs"></div>
        </div>
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

          document.querySelector('.svgs').innerHTML = results.join('');
          document.querySelector('.total').innerHTML = results.length;
        }
    
        searchSvg();

        const input = document.querySelector('input');

        input.addEventListener('keyup', (e) => {
          if (e.keyCode === 13) {
            searchSvg(e.target.value);
          }
        });
      </script>
    </body>
    </html>
  `;

  return pageHtml;
}