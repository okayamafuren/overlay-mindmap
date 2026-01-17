# 보안 정책

## 보안 구조

이 프로젝트는 Electron의 보안 모범 사례를 따릅니다.

### Context Isolation

- **활성화됨**: `contextIsolation: true`
- Renderer Process가 직접 Node.js API에 접근할 수 없도록 격리합니다.
- 모든 시스템 접근은 Preload Script를 통해서만 가능합니다.

### Node Integration

- **비활성화됨**: `nodeIntegration: false`
- Renderer Process에서 `require()`를 사용할 수 없습니다.
- 이는 악성 코드가 시스템에 직접 접근하는 것을 방지합니다.

### Preload Script

- `preload.js`를 통해 안전한 API만 노출합니다.
- `contextBridge`를 사용하여 Main Process와의 통신을 제어합니다.
- 허용된 기능만 `window.api` 객체를 통해 접근 가능합니다.

## 노출된 API

다음 API만 Renderer Process에서 사용할 수 있습니다:

- `window.api.saveFile(data)` - 파일 저장
- `window.api.openFile()` - 파일 열기
- `window.api.loadRecentFile()` - 최근 파일 불러오기
- `window.api.loadAutosave()` - 자동 저장 파일 불러오기
- `window.api.autoSave(data)` - 자동 저장
- `window.api.setIgnoreMouseEvents(ignore, options)` - 마우스 이벤트 통과 설정
- `window.api.toggleMouseEvents(ignore)` - 마우스 이벤트 토글
- `window.api.toggleFullscreen()` - 전체화면 토글
- `window.api.minimizeWindow()` - 창 최소화
- `window.api.quitApp()` - 앱 종료
- `window.api.isFullscreen()` - 전체화면 상태 확인
- `window.api.openExternal(url)` - 외부 링크 열기

## 취약점 신고

보안 취약점을 발견하셨다면, GitHub Issues를 통해 신고해주세요. 
심각한 취약점의 경우, 공개 전에 비공개로 논의할 수 있습니다.

## 보안 업데이트

보안 관련 업데이트는 가능한 한 빠르게 패치됩니다.
중요한 보안 업데이트가 있을 경우 GitHub Releases에 명시됩니다.
