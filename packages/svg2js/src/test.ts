type o  = { [key: string]: string };

function getUrlParams(callback: (data: o) => {}) {
  const search = window.location.href;
  const urlParam: o = {};

  if(search.indexOf('?') != -1) {
    const str = search.split('?', 2)[1];
    const strs = str.split('&');
    strs.forEach(strItem=>{
      const itemArr: string[] = [] = strItem.split('=');
      urlParam[itemArr[0]] = decodeURIComponent(itemArr[1])
    });
    callback && callback(urlParam);
  }
}