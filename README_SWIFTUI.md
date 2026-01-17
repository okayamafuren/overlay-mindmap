# MnemonistMap - macOS 네이티브 앱

Electron 기반 마인드맵 앱을 macOS 네이티브 SwiftUI 앱으로 변환한 프로젝트입니다.

## 프로젝트 구조

```
MnemonistMap/
├── MnemonistMapApp.swift      # 앱 진입점
├── Models/
│   └── Models.swift            # 데이터 모델 (Node, Connection, Document)
├── ViewModels/
│   └── ViewModels.swift        # MVVM ViewModel
├── Views/
│   ├── ContentView.swift       # 메인 컨텐츠 뷰
│   ├── CanvasView.swift        # 캔버스 뷰 (노드/연결선 렌더링)
│   ├── NodeView.swift          # 개별 노드 뷰
│   ├── ToolbarView.swift       # 상단 툴바
│   ├── NodePropertiesPanel.swift # 노드 속성 패널
│   └── HelpPanel.swift         # 도움말 패널
├── Assets.xcassets/            # 앱 아이콘 및 리소스
├── Info.plist                  # 앱 정보
└── MnemonistMap.entitlements   # App Sandbox 권한 설정
```

## 주요 기능

### ✅ 구현된 기능

1. **노드 관리**
   - 노드 추가/삭제/편집
   - 노드 드래그
   - 노드 크기 조절 (S 키 + 드래그)
   - 노드 선택 (단일/다중)

2. **연결 관리**
   - 노드 간 연결
   - 연결선 스타일 (실선/점선/굵은 선)
   - 연속 연결 모드

3. **줌 & 팬**
   - 마우스 휠 줌
   - 키보드 줌 (+/-)
   - 팬 (드래그)
   - 맞춤 보기 (F)

4. **파일 관리**
   - JSON 형식 저장/불러오기
   - 자동 저장 (30초마다)
   - 최근 파일 자동 로드

5. **특수 기능**
   - 암기 모드 (M)
   - 마우스 통과 모드 (P)
   - 검색 기능
   - 그리드 표시/숨김

6. **보안**
   - App Sandbox 활성화
   - 사용자 선택 파일만 접근
   - 네트워크 접근 차단

## 빌드 방법

### Xcode에서 빌드

1. Xcode에서 `MnemonistMap.xcodeproj` 열기
2. Product > Build (⌘B)
3. Product > Run (⌘R)

### 명령줄에서 빌드

```bash
xcodebuild -project MnemonistMap.xcodeproj -scheme MnemonistMap -configuration Release
```

## 보안 설정

### App Sandbox

`MnemonistMap.entitlements` 파일에서 다음 권한이 설정되어 있습니다:

- ✅ **App Sandbox**: 활성화
- ✅ **User Selected File**: 읽기/쓰기 허용
- ✅ **Downloads Folder**: 읽기/쓰기 허용
- ❌ **Network**: 차단 (로컬 처리만)

### 파일 접근

앱은 다음 위치에 접근할 수 있습니다:

1. 사용자가 명시적으로 선택한 파일 (저장/열기 다이얼로그)
2. Documents 디렉토리 (자동 저장용)
3. Downloads 폴더

## 데이터 형식

### 저장 파일 (JSON)

```json
{
  "nodes": [
    {
      "id": "UUID",
      "text": "노드 텍스트",
      "x": 0.0,
      "y": 0.0,
      "color": "#2d89ef",
      "size": 30.0,
      "shape": "circle",
      "fontSize": 14.0,
      "borderWidth": 2.0,
      "opacity": 0.9,
      "icon": null,
      "memo": null,
      "tags": [],
      "priority": null,
      "progress": null,
      "link": null,
      "image": null,
      "imageAspectRatio": 1.0,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "connections": [
    {
      "id": "UUID",
      "fromNodeId": "UUID",
      "toNodeId": "UUID",
      "style": "solid",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "version": "2.0",
  "timestamp": 1234567890.0,
  "zoom": 1.0,
  "panX": 0.0,
  "panY": 0.0,
  "boardColor": "#1a1a1a",
  "boardColorMode": "black",
  "showGrid": true
}
```

## 단축키

### 기본 조작
- `A`: 노드 추가
- `C`: 연결 모드 토글
- `F`: 화면에 맞춤
- `G`: 그리드 표시/숨김
- `M`: 암기 모드 토글
- `P`: 마우스 통과 모드
- `S`: 크기 조절 모드
- `?`: 도움말 표시/숨기기

### 편집
- `⌘S`: 저장
- `⌘O`: 열기
- `⌘Z`: 실행 취소
- `⌘⇧Z`: 다시 실행
- `⌘C`: 복사
- `⌘V`: 붙여넣기
- `⌘A`: 전체 선택

### 줌/네비게이션
- `+/-`: 줌 인/아웃
- `0`: 줌 리셋 (100%)
- `↑↓←→`: 캔버스 이동

## MVVM 아키텍처

### Model
- `MindMapNode`: 노드 데이터 모델
- `Connection`: 연결선 데이터 모델
- `MindMapDocument`: 전체 문서 모델
- `HistoryState`: 실행 취소/다시 실행용 히스토리

### ViewModel
- `MindMapViewModel`: 모든 비즈니스 로직 포함
  - 노드 관리
  - 연결 관리
  - 줌/팬
  - 파일 저장/불러오기
  - 히스토리 관리

### View
- SwiftUI 뷰들로 구성
- `@EnvironmentObject`로 ViewModel 공유
- 반응형 UI 업데이트

## 향후 개선 사항

- [ ] 이미지 노드 지원 완성
- [ ] 컨텍스트 메뉴 구현
- [ ] 정렬 기능 구현
- [ ] 레이아웃 알고리즘 (트리, 원형, 그리드 등)
- [ ] 복사/붙여넣기 기능
- [ ] 노드 그룹화
- [ ] 통계 및 분석 기능
- [ ] 테마 시스템
- [ ] 단축키 커스터마이징

## 라이선스

이 프로젝트는 기억술 학습을 위한 오버레이 마인드맵 도구입니다.
