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
        background: #fafafa;
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
        background: #f1f2f2;
      }
      .svg {
        font-size: 12px;
        text-align: left;
        margin-right: 15px;
        margin-bottom: 15px;
        cursor: pointer;
        min-width: 156px;
        height: 50px;
        background: #fff;
        border-radius: 3px;
        box-shadow: 3px 3px 6px -2px #cdcdcd;
        vertical-align: top;
        display: inline-flex;
        align-items: center;
        padding: 0 10px;
      }
      .svg .svg-info {
        flex: 1;
        margin-left: 9px;
        border-left: 2px solid #eee;
        padding-left: 4px;
      }
      .svg svg {
        margin: 10px auto 8px;
        display: block;
        width: 24px!important;
        height: 24px!important;
      }
      .svg-name {
        text-align: center;
        padding: 0 5px;
        word-break: break-all;
        line-height: 15px;
      }
      .svg-info-item {
        padding: 1px 5px;
      }
      .svg-info-item span {
        font-size: 12px;
        color: #a8a6a6;
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
          <small style="color: #666;">* 点击下面的图标即可复制组件代码</small>
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
            <div class="svg-info">
              <p class="svg-info-item"><span>文件名</span> <b>\${filename}</b></p>
              <p class="svg-info-item"><span>压缩率</span> \${percent}%</p>
            </div>
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
