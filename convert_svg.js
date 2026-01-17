const fs = require('fs');
const svgContent = fs.readFileSync('icon.svg', 'utf8');
// SVG를 base64로 인코딩하여 data URI로 만들고
// 간단한 HTML 파일을 만들어서 브라우저로 렌더링하는 방법은 복잡함
// 대신 사용자에게 수동 변환을 안내하거나
// 온라인 도구 사용을 권장
console.log('SVG to PNG conversion requires additional tools.');
console.log('Please use an online converter or install ImageMagick/rsvg-convert');
