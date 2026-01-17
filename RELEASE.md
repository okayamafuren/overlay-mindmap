# Release v1.0.0

## 🎉 첫 번째 공식 릴리즈!

Overlay Mindmap의 첫 번째 안정 버전입니다.

## 주요 기능

### 🎯 핵심 기능
- 투명 오버레이 마인드맵
- 마우스 이벤트 통과 모드
- 무한 캔버스
- 자동 저장

### 🎨 커스터마이징
- 노드 색상, 모양, 크기 조절
- 폰트 크기 및 스타일
- 테두리 설정
- 이미지 노드 지원

### 🔗 연결 기능
- 노드 간 연결
- 연결선 스타일 (실선/점선/굵은 선)
- 동적 연결선

### 📐 정렬 및 레이아웃
- 6가지 정렬 옵션
- 그리드 표시
- 줌 & 팬

### 🔍 검색 및 탐색
- 노드 검색
- 검색 결과 하이라이트
- 키보드 단축키

### 💾 파일 관리
- JSON 형식 저장/불러오기
- 자동 저장
- 최근 파일 자동 로드

### 🎯 특수 모드
- 암기 모드 (M 키)
- 마우스 통과 모드 (P 키)
- 전체화면 모드 (F11)

## 시스템 요구사항

- **macOS**: 10.13 이상
- **Windows**: Windows 10 이상
- **Linux**: Ubuntu 18.04 이상 (또는 호환 배포판)

## 다운로드

### macOS
- [Overlay Mindmap-1.0.0.dmg](https://github.com/okayamafuren/overlay-mindmap/releases/download/v1.0.0/Overlay-Mindmap-1.0.0.dmg) - 설치 프로그램
- [Overlay Mindmap-1.0.0-mac.zip](https://github.com/okayamafuren/overlay-mindmap/releases/download/v1.0.0/Overlay-Mindmap-1.0.0-mac.zip) - ZIP 아카이브

### Windows
- [Overlay Mindmap Setup 1.0.0.exe](https://github.com/okayamafuren/overlay-mindmap/releases/download/v1.0.0/Overlay-Mindmap-Setup-1.0.0.exe) - 설치 프로그램
- [Overlay Mindmap-1.0.0-win.zip](https://github.com/okayamafuren/overlay-mindmap/releases/download/v1.0.0/Overlay-Mindmap-1.0.0-win.zip) - ZIP 아카이브

### Linux
- [Overlay Mindmap-1.0.0.AppImage](https://github.com/okayamafuren/overlay-mindmap/releases/download/v1.0.0/Overlay-Mindmap-1.0.0.AppImage) - AppImage
- [Overlay Mindmap_1.0.0_amd64.deb](https://github.com/okayamafuren/overlay-mindmap/releases/download/v1.0.0/Overlay-Mindmap_1.0.0_amd64.deb) - Debian 패키지

## 설치 방법

### macOS
1. DMG 파일을 다운로드하고 열기
2. Overlay Mindmap을 Applications 폴더로 드래그
3. 실행 시 보안 경고가 나타나면:
   - 시스템 설정 → 보안 및 개인 정보 보호 → "확인 없이 열기" 클릭
   - 또는 우클릭 → 열기

### Windows
1. EXE 파일을 다운로드
2. 실행하고 설치 마법사를 따라 진행
3. 바탕화면 또는 시작 메뉴에서 실행

### Linux
**AppImage:**
```bash
chmod +x Overlay-Mindmap-1.0.0.AppImage
./Overlay-Mindmap-1.0.0.AppImage
```

**DEB 패키지:**
```bash
sudo dpkg -i Overlay-Mindmap_1.0.0_amd64.deb
sudo apt-get install -f  # 의존성 해결
```

## 알려진 문제

- macOS에서 첫 실행 시 보안 경고가 나타날 수 있습니다 (정상 동작)
- 일부 Linux 배포판에서 추가 의존성이 필요할 수 있습니다

## 기여

버그 리포트나 기능 제안은 [GitHub Issues](https://github.com/okayamafuren/overlay-mindmap/issues)에 등록해 주세요.

## 라이선스

MIT License - 자유롭게 사용, 수정, 배포할 수 있습니다.
