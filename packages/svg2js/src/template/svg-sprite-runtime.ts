export function createSvgSpriteRuntimeJs(spriteId: any, svgSymbols: string[], svgXMLNs: string): string {
  const runtimeJs =  `document.addEventListener('DOMContentLoaded', function() {
  const svgWrapperEl = document.createElement('div');

  svgWrapperEl.id = '${spriteId}';
  svgWrapperEl.style = 'position: absolute; width: 0; height: 0; overflow: hidden;';
  svgWrapperEl.setAttribute('aria-hidden', true);
  svgWrapperEl.innerHTML = \`<svg xmlns="${svgXMLNs}">${svgSymbols.join('')}</svg>\`;

  document.body.appendChild(svgWrapperEl);
});
`;

  return runtimeJs;
}