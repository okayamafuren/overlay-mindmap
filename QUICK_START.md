# 빠른 시작 가이드

## GitHub에 푸시하기

```bash
cd /Users/kangkyunghun/Desktop/overlay-mindmap

# Git 초기화 (처음 한 번만)
git init
git remote add origin https://github.com/okayamafuren/overlay-mindmap.git

# 모든 파일 추가 및 커밋
git add .
git commit -m "Initial release v1.0.0"

# 메인 브랜치로 푸시
git branch -M main
git push -u origin main
```

## 릴리즈 생성

1. **빌드 실행** (macOS에서):
   ```bash
   npm run dist:mac
   ```

2. **GitHub 웹에서 릴리즈 생성**:
   - https://github.com/okayamafuren/overlay-mindmap/releases
   - "Create a new release" 클릭
   - 태그: `v1.0.0`
   - 제목: `v1.0.0 - 첫 번째 공식 릴리즈`
   - 설명: `RELEASE.md` 내용 복사/붙여넣기
   - `dist/` 폴더의 파일들 업로드
   - "Publish release" 클릭

자세한 내용은 [RELEASE_GUIDE.md](RELEASE_GUIDE.md)를 참조하세요.
