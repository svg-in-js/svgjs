export function createPreviewPage(svgSpriteRuntime: string, svgsData: object, compressPercentObj: object): string {
  const pageHtml = `
  <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Preview Svgs</title>
      <style>
      * {
        padding: 0;
        margin: 0;
      }
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
      .top-bar {
        padding: 10px;
        border-bottom: 1px solid #ccc;
      }
      input {
        width: 170px;
        padding: 2px 3px;
      }
      .main-content {
        flex: 1;
        overflow: auto;
        padding: 10px;
      }
      .svg {
        display: inline-block;
        font-size: 12px;
        text-align: left;
        margin-right: 15px;
        margin-bottom: 15px;
        cursor: pointer;
      }
      .message {
        position: fixed;
        top: -38px;
        left: 50%;
        opacity: 0;
        color: #666;
        transform: translateX(-50%);
        padding: 8px 15px;
        font-size: 12px;
        border-radius: 3px;
        transition: .5s ease-in-out;
        border: 1px solid #8ce6b0;
        background-color: #edfff3;
      }
      .message span {
        color: #000;
      }
      .message.show {
        opacity: 1;
        top: 5px;
      }
      </style>
    </head>
    <body>
      <div id="app">
        <div class="top-bar">
          <input placeholder="查询 svg" />
          <span>共 <b class="total"></b> 个</span>
          <span style="margin-left: 35px">设置图标组件名</span>
          <input id="comp-name" />
          <small style="color: #666;">* 点击图标即可复制代码</small>
        </div>
    
        <div class="main-content">
          <div class="svgs"></div>
        </div>
      </div>
      <div class="message">复制成功！<span id="show-code"></span></div>
      <script>
        ${svgSpriteRuntime}
      </script>
      <script type="module">
        let msgTimer;
        const defaultCompName = 'symbol-icon';
        const compNameEl = document.querySelector('#comp-name');
        const msgBar = document.querySelector('.message');
        const codeCont = msgBar.querySelector('#show-code');
        
        compNameEl.setAttribute('placeholder', defaultCompName);
    
        window.copy = (str) => {
          const tag = compNameEl.value || defaultCompName;
          const code = \`<\${tag} name="\${str}" />\`;
          const _copy = function (e) {
            e.clipboardData.setData('text/plain', code);
            e.preventDefault();
          };
    
          document.addEventListener('copy', _copy);
          document.execCommand('copy');
          document.removeEventListener('copy', _copy);
    
          codeCont.textContent = code;
          msgBar.classList.add('show');
    
          if (msgTimer) clearTimeout(msgTimer);
          
          msgTimer = setTimeout(() => {
            msgBar.classList.remove('show');
          }, 2000);
        }

        const svgsData = ${JSON.stringify(svgsData)};
        const compressPercentObj = ${JSON.stringify(compressPercentObj)};
        const svgItem = (filename, data, percent) => {
          return \`<div class="svg" onclick="copy('\${filename}')">
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
