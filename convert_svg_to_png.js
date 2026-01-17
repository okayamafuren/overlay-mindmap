const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

async function convertSVGtoPNG() {
    try {
        // SVG 파일 읽기
        const svgContent = fs.readFileSync('icon.svg', 'utf8');
        
        // Canvas 생성
        const canvas = createCanvas(512, 512);
        const ctx = canvas.getContext('2d');
        
        // SVG를 이미지로 로드
        const img = await loadImage('data:image/svg+xml;base64,' + Buffer.from(svgContent).toString('base64'));
        
        // Canvas에 그리기
        ctx.drawImage(img, 0, 0, 512, 512);
        
        // PNG로 저장
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync('icon.png', buffer);
        
        console.log('Successfully converted icon.svg to icon.png');
    } catch (error) {
        console.error('Error:', error.message);
        console.log('Note: canvas package may need to be installed: npm install canvas');
    }
}

convertSVGtoPNG();
