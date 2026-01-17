# 기여 가이드

Overlay Mindmap 프로젝트에 기여해주셔서 감사합니다! 🎉

## 기여 방법

### 1. 이슈 리포트

버그를 발견하거나 기능 제안이 있으시면 GitHub Issues를 통해 알려주세요.

- **버그 리포트**: 재현 가능한 단계와 예상 동작을 포함해주세요.
- **기능 제안**: 사용 사례와 필요성을 설명해주세요.

### 2. Pull Request

#### 개발 환경 설정

```bash
# 저장소 클론
git clone https://github.com/your-username/overlay-mindmap.git
cd overlay-mindmap

# 의존성 설치
npm install

# 개발 모드 실행
npm start
```

#### 코드 스타일

- JavaScript 코드는 기본적으로 기존 스타일을 따릅니다.
- 함수와 변수명은 명확하고 의미 있는 이름을 사용합니다.
- 주석은 한국어로 작성 가능합니다.

#### 보안 규칙

⚠️ **중요**: 보안 관련 변경 시 다음 규칙을 반드시 지켜주세요:

1. **Renderer Process에서 직접 Node.js API 사용 금지**
   - `require('electron')` 사용 금지
   - `require('fs')`, `require('path')` 등 직접 사용 금지
   - 모든 시스템 접근은 `preload.js`를 통해 `window.api`로만 가능

2. **새로운 IPC 통신 추가 시**
   - `preload.js`에 안전한 API 추가
   - `main.js`에 핸들러 추가
   - `renderer.js`에서는 `window.api`를 통해서만 호출

3. **외부 링크 열기**
   - `window.api.openExternal(url)` 사용
   - 직접 `shell.openExternal()` 호출 금지

#### Pull Request 프로세스

1. **Fork & Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **변경사항 커밋**
   ```bash
   git commit -m "Add: 새로운 기능 설명"
   ```

3. **테스트**
   - 변경사항이 정상 작동하는지 확인
   - 기존 기능이 깨지지 않는지 확인

4. **Push & PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   - GitHub에서 Pull Request 생성
   - 변경사항을 명확히 설명

#### 커밋 메시지 규칙

- `Add:` 새로운 기능 추가
- `Fix:` 버그 수정
- `Update:` 기능 개선
- `Refactor:` 코드 리팩토링
- `Docs:` 문서 수정
- `Style:` 코드 포맷팅
- `Test:` 테스트 추가/수정

예시:
```
Add: 노드에 이미지 첨부 기능 추가
Fix: 전체화면 모드에서 마우스 이벤트 처리 오류 수정
Update: 파일 저장 시 진행률 표시 개선
```

## 개발 가이드

### 프로젝트 구조

```
overlay-mindmap/
├── main.js          # Electron 메인 프로세스 (시스템 접근)
├── preload.js       # Preload 스크립트 (안전한 API 노출)
├── renderer.js      # 렌더러 프로세스 (UI 로직)
├── index.html       # UI 구조
├── style.css        # 스타일
└── package.json     # 프로젝트 설정
```

### 주요 파일 설명

- **main.js**: 창 관리, 파일 I/O, IPC 핸들러
- **preload.js**: Context Bridge를 통한 안전한 API 노출
- **renderer.js**: 마인드맵 렌더링 및 사용자 인터랙션

### 보안 체크리스트

PR 제출 전 확인사항:

- [ ] Renderer Process에서 `require()` 사용하지 않음
- [ ] 모든 시스템 접근이 `window.api`를 통해 이루어짐
- [ ] 새로운 IPC 통신이 `preload.js`에 정의됨
- [ ] 외부 링크는 `window.api.openExternal()` 사용

## 질문이 있으신가요?

GitHub Issues를 통해 질문해주세요. 가능한 한 빠르게 답변드리겠습니다.

감사합니다! 🙏
