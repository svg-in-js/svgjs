export function createSvgSpriteRuntimeJs(spriteId: string, svgSymbols: string[], svgXMLNs: string): string {
  const runtimeJs =  `
    document.addEventListener('DOMContentLoaded', function() {
      const svgWrapperEl = document.createElement('div');
    
      svgWrapperEl.id = '${spriteId}';
      svgWrapperEl.style = 'position: absolute; width: 0; height: 0;';
      svgWrapperEl.setAttribute('aria-hidden', true);
      svgWrapperEl.innerHTML = \`<svg xmlns="${svgXMLNs}">${svgSymbols.join('')}</svg>\`;
    
      document.body.appendChild(svgWrapperEl);
    });
  `;

  return runtimeJs;
}