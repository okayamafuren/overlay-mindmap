# Overlay Mindmap

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub release](https://img.shields.io/github/release/okayamafuren/overlay-mindmap.svg)](https://github.com/okayamafuren/overlay-mindmap/releases)

투명 오버레이 마인드맵 애플리케이션 - 화면 위에 항상 표시되는 마인드맵 도구

## ✨ 주요 기능

- 🎯 **투명 오버레이**: 화면 위에 항상 표시되는 투명 마인드맵
- 🖱️ **마우스 이벤트 통과**: 다른 앱 사용 중에도 방해받지 않음 (P 키로 토글)
- 🎨 **다양한 커스터마이징**: 노드 색상, 모양, 크기, 폰트, 테두리 조절
- 💾 **자동 저장**: 작업 내용 자동 저장
- 📁 **파일 저장/불러오기**: JSON 형식으로 저장
- 🔍 **검색 기능**: 노드 검색 및 하이라이트
- ⌨️ **키보드 단축키**: 빠른 작업을 위한 단축키 지원
- 📐 **정렬 기능**: 왼쪽/오른쪽/위/아래/수평/수직 정렬
- 🖼️ **이미지 노드**: 이미지 추가 및 비율 조절
- 🎯 **암기 모드**: 노드 텍스트 숨기기 (M 키)
- 🔗 **연결선 스타일**: 실선/점선/굵은 선
- 📋 **컨텍스트 툴바**: 우클릭으로 빠른 스타일 변경
- 🎨 **보드 설정**: 보드 색상 및 투명도 조절
- 📊 **그리드 표시**: 그리드 표시/숨김 (G 키)

## 설치 방법

### 개발 환경에서 실행

```bash
# 의존성 설치
npm install

# 앱 실행
npm start
```

## 빌드 방법

### macOS 빌드

```bash
# macOS용 빌드 (DMG + ZIP)
npm run build:mac

# 또는 dist 폴더에만 생성 (GitHub release 업로드용)
npm run dist:mac
```

### Windows 빌드

```bash
# Windows용 빌드 (NSIS 설치 프로그램 + ZIP)
npm run build:win

# 또는 dist 폴더에만 생성
npm run dist:win
```

### Linux 빌드

```bash
# Linux용 빌드 (AppImage, DEB, ZIP)
npm run build:linux

# 또는 dist 폴더에만 생성
npm run dist:linux
```

### 모든 플랫폼 빌드

```bash
npm run build:all
```

빌드된 파일은 `dist/` 폴더에 생성됩니다.

## GitHub Release 배포

### 1. 버전 업데이트

`package.json`의 `version` 필드를 업데이트하세요:

```json
{
  "version": "1.0.0"
}
```

### 2. 빌드 실행

```bash
# 원하는 플랫폼 빌드
npm run dist:mac
npm run dist:win
npm run dist:linux
```

### 3. GitHub Release 생성

1. GitHub 저장소로 이동
2. **Releases** → **Create a new release** 클릭
3. 태그 생성 (예: `v1.0.0`)
4. Release 제목 및 설명 작성
5. `dist/` 폴더의 빌드 파일들을 업로드:
   - macOS: `Overlay Mindmap-1.0.0-mac.zip`, `Overlay Mindmap-1.0.0.dmg`
   - Windows: `Overlay Mindmap Setup 1.0.0.exe`, `Overlay Mindmap-1.0.0-win.zip`
   - Linux: `Overlay Mindmap-1.0.0.AppImage`, `Overlay Mindmap_1.0.0_amd64.deb`

### 4. 자동 GitHub Release (선택사항)

`package.json`의 `build.publish` 섹션에 GitHub 정보를 추가하면 자동으로 업로드할 수 있습니다:

```json
"publish": {
  "provider": "github",
  "owner": "your-username",
  "repo": "overlay-mindmap"
}
```

그 후:

```bash
# GitHub 토큰 설정 (환경 변수)
export GH_TOKEN=your_github_token

# 자동으로 GitHub release에 업로드
npm run build
```

## 보안

이 프로젝트는 Electron의 보안 모범 사례를 따릅니다:

- ✅ **Context Isolation** 활성화
- ✅ **Node Integration** 비활성화
- ✅ **Preload Script**를 통한 안전한 API 노출

자세한 내용은 [SECURITY.md](SECURITY.md)를 참조하세요.

## 기술 스택

- **Electron**: 크로스 플랫폼 데스크톱 앱 프레임워크
- **HTML5 Canvas**: 마인드맵 렌더링
- **Node.js**: 백엔드 로직

## 개발

### 프로젝트 구조

```
overlay-mindmap/
├── main.js          # Electron 메인 프로세스 (시스템 접근)
├── preload.js       # Preload 스크립트 (안전한 API 노출)
├── renderer.js      # 렌더러 프로세스 (마인드맵 로직)
├── index.html       # UI 구조
├── style.css        # 스타일
└── package.json     # 프로젝트 설정
```

### 주요 파일

- `main.js`: Electron 창 관리, 파일 I/O, IPC 통신
- `preload.js`: Context Bridge를 통한 안전한 API 노출 (보안)
- `renderer.js`: 마인드맵 렌더링 및 사용자 인터랙션 처리
- `index.html`: UI 구조 및 컨트롤 패널

## 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 기여

기여를 환영합니다! 자세한 내용은 [CONTRIBUTING.md](CONTRIBUTING.md)를 참조하세요.

- 🐛 버그 리포트: [GitHub Issues](https://github.com/okayamafuren/overlay-mindmap/issues)
- 💡 기능 제안: [GitHub Issues](https://github.com/okayamafuren/overlay-mindmap/issues)
- 🔒 보안 취약점: [SECURITY.md](SECURITY.md) 참조

## 다운로드

최신 릴리즈는 [Releases](https://github.com/okayamafuren/overlay-mindmap/releases) 페이지에서 다운로드할 수 있습니다.

## 변경사항

자세한 변경사항은 [CHANGELOG.md](CHANGELOG.md)를 참조하세요.
