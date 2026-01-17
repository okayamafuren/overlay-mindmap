/**
 * Preload Script - 안전한 IPC 통신 브릿지
 * 
 * 이 스크립트는 Renderer Process와 Main Process 간의 안전한 통신을 제공합니다.
 * Context Isolation을 통해 렌더러 프로세스가 직접 Node.js API에 접근하는 것을 방지합니다.
 */

const { contextBridge, ipcRenderer } = require('electron');

// 안전한 API를 window 객체에 노출
contextBridge.exposeInMainWorld('api', {
  // 파일 저장
  saveFile: (data) => ipcRenderer.invoke('save-file', data),
  
  // 파일 열기
  openFile: () => ipcRenderer.invoke('open-file'),
  
  // 최근 파일 불러오기
  loadRecentFile: () => ipcRenderer.invoke('load-recent-file'),
  
  // 자동 저장 파일 불러오기
  loadAutosave: () => ipcRenderer.invoke('load-autosave'),
  
  // 자동 저장
  autoSave: (data) => ipcRenderer.invoke('auto-save', data),
  
  // 마우스 이벤트 통과 설정
  setIgnoreMouseEvents: (ignore, options) => {
    ipcRenderer.send('set-ignore-mouse-events', ignore, options);
  },
  
  // 마우스 이벤트 통과 토글
  toggleMouseEvents: (ignore) => {
    ipcRenderer.send('toggle-mouse-events', ignore);
  },
  
  // 전체화면 토글
  toggleFullscreen: () => {
    ipcRenderer.send('window-toggle-fullscreen');
  },
  
  // 창 최소화
  minimizeWindow: () => {
    ipcRenderer.send('window-minimize');
  },
  
  // 앱 종료
  quitApp: () => {
    ipcRenderer.send('app-quit');
  },
  
  // 전체화면 상태 확인
  isFullscreen: () => ipcRenderer.invoke('is-fullscreen'),
  
  // 외부 링크 열기 (shell.openExternal)
  openExternal: (url) => {
    ipcRenderer.send('open-external', url);
  }
});

// 디버깅용 (개발 환경에서만)
if (process.env.NODE_ENV === 'development') {
  contextBridge.exposeInMainWorld('electron', {
    platform: process.platform,
    versions: process.versions
  });
}
