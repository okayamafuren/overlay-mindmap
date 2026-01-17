// 간단한 SVG to PNG 변환 스크립트
// Node.js에서 실행: node convert_simple.js
const fs = require('fs');
const { execSync } = require('child_process');

console.log('SVG를 PNG로 변환하는 중...');
console.log('macOS에서는 다음 방법 중 하나를 사용하세요:');
console.log('1. Preview 앱에서 icon.svg를 열고 File > Export > PNG로 저장');
console.log('2. 온라인 변환 도구 사용 (예: https://convertio.co/svg-png/)');
console.log('3. ImageMagick 설치: brew install imagemagick');
console.log('   그 후: convert icon.svg icon.png');
