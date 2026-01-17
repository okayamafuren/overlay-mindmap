# 빌드 가이드

## 로컬 빌드

### 사전 요구사항

- Node.js 18 이상
- npm 또는 yarn

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 모드 실행

```bash
npm start
```

### 3. 빌드

#### macOS

```bash
# DMG + ZIP 생성
npm run build:mac

# 또는 dist 폴더에만 생성 (GitHub release용)
npm run dist:mac
```

#### Windows

```bash
# NSIS 설치 프로그램 + ZIP 생성
npm run build:win

# 또는 dist 폴더에만 생성
npm run dist:win
```

#### Linux

```bash
# AppImage, DEB, ZIP 생성
npm run build:linux

# 또는 dist 폴더에만 생성
npm run dist:linux
```

#### 모든 플랫폼

```bash
npm run build:all
```

## GitHub Release 배포

### 수동 배포

1. **버전 업데이트**
   
   `package.json`의 `version` 필드를 업데이트:
   ```json
   {
     "version": "1.0.0"
   }
   ```

2. **빌드 실행**
   ```bash
   npm run dist:mac
   npm run dist:win
   npm run dist:linux
   ```

3. **Git 태그 생성 및 푸시**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

4. **GitHub에서 Release 생성**
   - GitHub 저장소 → Releases → Draft a new release
   - 태그 선택 (v1.0.0)
   - 제목 및 설명 작성
   - `dist/` 폴더의 빌드 파일들 업로드

### 자동 배포 (GitHub Actions)

태그를 푸시하면 자동으로 빌드되고 Release에 업로드됩니다:

```bash
git tag v1.0.0
git push origin v1.0.0
```

`.github/workflows/release.yml` 파일이 자동으로 빌드하고 Release를 생성합니다.

## 빌드 파일 위치

모든 빌드 파일은 `dist/` 폴더에 생성됩니다:

- **macOS**: 
  - `Overlay Mindmap-1.0.0-mac.zip`
  - `Overlay Mindmap-1.0.0.dmg`
  
- **Windows**: 
  - `Overlay Mindmap Setup 1.0.0.exe`
  - `Overlay Mindmap-1.0.0-win.zip`
  
- **Linux**: 
  - `Overlay Mindmap-1.0.0.AppImage`
  - `Overlay Mindmap_1.0.0_amd64.deb`
  - `Overlay Mindmap-1.0.0-linux.zip`

## 문제 해결

### macOS 코드 서명 오류

macOS에서 빌드 시 코드 서명 오류가 발생할 수 있습니다. 개발용 빌드의 경우 `package.json`의 `build.mac.hardenedRuntime`를 `false`로 설정하거나, entitlements 파일을 조정할 수 있습니다.

### Windows 빌드 오류

Windows 빌드 시 NSIS 설치 프로그램 생성에 문제가 있을 수 있습니다. 이 경우 ZIP 파일만 생성하도록 `package.json`의 `build.win.target`을 조정하세요.

### Linux 빌드 오류

Linux 빌드 시 AppImage 생성에 문제가 있을 수 있습니다. 필요한 의존성을 설치하세요:

```bash
# Ubuntu/Debian
sudo apt-get install -y libnss3 libatk-bridge2.0-0 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2
```
