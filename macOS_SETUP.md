# macOS 개발 환경 설정 가이드

## 앱 실행 확인

앱이 정상적으로 실행되었다면 투명한 마인드맵 창이 화면에 표시되어야 합니다.

## macOS 권한 설정

### 1. 화면 기록 권한 (필수)

투명 오버레이 앱이 다른 앱 위에 표시되려면 화면 기록 권한이 필요할 수 있습니다.

**설정 방법:**
1. 시스템 설정 (System Settings) 열기
2. **개인정보 보호 및 보안** (Privacy & Security) 선택
3. **화면 기록** (Screen Recording) 선택
4. 터미널 또는 Electron 앱에 체크 표시

또는 터미널에서:
```bash
# 권한 확인 (선택사항)
tccutil reset ScreenRecording
```

### 2. 접근성 권한 (선택사항)

마우스 이벤트를 가로채거나 다른 앱과 상호작용할 때 필요할 수 있습니다.

**설정 방법:**
1. 시스템 설정 → **개인정보 보호 및 보안**
2. **접근성** (Accessibility) 선택
3. 터미널 또는 Electron 앱에 체크 표시

### 3. 권한 문제 해결

앱이 제대로 작동하지 않는다면:

```bash
# 권한 재설정
tccutil reset All com.overlaymindmap.app

# 또는 Electron 앱 전체
tccutil reset All com.electron
```

## 포커스 문제 해결

### alwaysOnTop 동작 확인

`main.js`에서 `alwaysOnTop: true` 설정이 되어 있지만, 다른 앱을 클릭했을 때:

1. **마우스 이벤트 통과 모드**: 
   - 툴바의 마우스 토글 버튼 사용
   - 또는 단축키로 전환

2. **창이 가려지는 경우**:
   - `skipTaskbar: true` 설정으로 작업 표시줄에서 숨겨짐
   - Cmd+Tab으로 앱 전환 필요

### 디버깅 팁

```javascript
// main.js에서 디버깅 정보 출력
console.log('Window created:', {
  alwaysOnTop: mainWindow.isAlwaysOnTop(),
  visible: mainWindow.isVisible(),
  focused: mainWindow.isFocused()
});
```

## 개발 모드 실행

```bash
# 개발 모드로 실행 (디버그 콘솔 포함)
npm start

# 또는 Electron 개발자 도구 열기
# 앱 실행 후: Cmd+Option+I
```

## 빌드 및 테스트

```bash
# macOS 빌드
npm run dist:mac

# 빌드된 앱 실행
open "dist/Overlay Mindmap.app"
```

## 문제 해결

### 앱이 보이지 않는 경우

1. **다른 창 뒤에 있는지 확인**
   ```bash
   # 모든 Electron 창 찾기
   ps aux | grep -i electron
   ```

2. **창 위치 확인**
   - `main.js`에서 창 위치를 화면 중앙으로 설정되어 있음
   - 투명도가 너무 높아서 보이지 않을 수 있음

3. **콘솔 로그 확인**
   ```bash
   # 터미널에서 실행 시 로그 확인
   npm start
   ```

### 마우스 이벤트가 작동하지 않는 경우

1. **권한 확인**: 접근성 권한이 허용되었는지 확인
2. **마우스 통과 모드**: 툴바에서 토글 버튼 확인
3. **코드 확인**: `preload.js`의 `setIgnoreMouseEvents` 함수 확인

## 성능 최적화

### 메모리 사용량 확인

```bash
# 앱 프로세스 확인
ps aux | grep "Overlay Mindmap"
```

### 렌더링 성능

- Canvas 크기 조절
- 노드 개수 제한
- 자동 저장 간격 조정 (기본 30초)

## 참고 자료

- [Electron Security 가이드](https://www.electronjs.org/docs/latest/tutorial/security)
- [macOS 권한 설정](https://developer.apple.com/documentation/security/app_sandbox)
