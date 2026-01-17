# GitHub 릴리즈 가이드

이 문서는 Overlay Mindmap을 GitHub에 릴리즈하는 방법을 안내합니다.

## 1. Git 저장소 초기화 및 커밋

```bash
cd /Users/kangkyunghun/Desktop/overlay-mindmap

# Git 초기화 (이미 되어있다면 생략)
git init

# 원격 저장소 추가
git remote add origin https://github.com/okayamafuren/overlay-mindmap.git

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "Initial release v1.0.0"

# 메인 브랜치로 푸시
git branch -M main
git push -u origin main
```

## 2. 빌드 실행

### macOS 빌드
```bash
npm run dist:mac
```

### Windows 빌드 (Windows 머신에서)
```bash
npm run dist:win
```

### Linux 빌드 (Linux 머신에서)
```bash
npm run dist:linux
```

빌드된 파일은 `dist/` 폴더에 생성됩니다.

## 3. GitHub 릴리즈 생성

### 방법 1: GitHub 웹 인터페이스 사용 (권장)

1. GitHub 저장소로 이동: https://github.com/okayamafuren/overlay-mindmap

2. **Releases** 섹션 클릭 → **Create a new release** 클릭

3. 릴리즈 정보 입력:
   - **Tag version**: `v1.0.0` (태그 이름)
   - **Release title**: `v1.0.0 - 첫 번째 공식 릴리즈`
   - **Description**: 아래 내용 복사/붙여넣기

```markdown
## 🎉 첫 번째 공식 릴리즈!

Overlay Mindmap의 첫 번째 안정 버전입니다.

### 주요 기능
- 🎯 투명 오버레이 마인드맵
- 🖱️ 마우스 이벤트 통과 모드
- 🎨 노드 커스터마이징
- 💾 자동 저장
- 🔍 검색 기능
- ⌨️ 키보드 단축키
- 📐 정렬 기능
- 🖼️ 이미지 노드 지원

### 다운로드
- **macOS**: DMG 또는 ZIP 파일
- **Windows**: EXE 설치 프로그램 또는 ZIP 파일
- **Linux**: AppImage 또는 DEB 패키지

자세한 내용은 [CHANGELOG.md](CHANGELOG.md)를 참조하세요.
```

4. **Attach binaries** 섹션에서 `dist/` 폴더의 빌드 파일들을 드래그 앤 드롭:
   - macOS: `Overlay Mindmap-1.0.0.dmg`, `Overlay Mindmap-1.0.0-mac.zip`
   - Windows: `Overlay Mindmap Setup 1.0.0.exe`, `Overlay Mindmap-1.0.0-win.zip`
   - Linux: `Overlay Mindmap-1.0.0.AppImage`, `Overlay Mindmap_1.0.0_amd64.deb`

5. **Publish release** 클릭

### 방법 2: GitHub CLI 사용

```bash
# GitHub CLI 설치 필요: https://cli.github.com/

# 로그인
gh auth login

# 릴리즈 생성
gh release create v1.0.0 \
  --title "v1.0.0 - 첫 번째 공식 릴리즈" \
  --notes-file RELEASE.md \
  dist/*.dmg \
  dist/*.zip \
  dist/*.exe \
  dist/*.AppImage \
  dist/*.deb
```

## 4. 릴리즈 확인

릴리즈가 성공적으로 생성되면:
- https://github.com/okayamafuren/overlay-mindmap/releases 에서 확인 가능
- README.md의 다운로드 섹션이 자동으로 업데이트됨

## 문제 해결

### 빌드 실패 시
- Node.js 버전 확인 (18 이상 권장)
- `npm install` 재실행
- `node_modules` 삭제 후 재설치

### GitHub 푸시 실패 시
- 인증 확인: `gh auth status`
- 원격 저장소 확인: `git remote -v`
- 권한 확인: GitHub 저장소 설정에서 확인

### 릴리즈 파일 크기 제한
- GitHub 릴리즈는 파일당 2GB 제한
- 대용량 파일은 GitHub LFS 사용 고려

## 다음 릴리즈

새 버전을 릴리즈할 때:

1. `package.json`의 `version` 업데이트
2. `CHANGELOG.md`에 변경사항 추가
3. 태그 생성 및 푸시: `git tag v1.0.1 && git push origin v1.0.1`
4. 위의 2-3단계 반복
