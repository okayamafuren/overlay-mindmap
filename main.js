const { app, BrowserWindow, ipcMain, dialog, screen, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Single instance lock - 앱 중복 실행 방지
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // 이미 다른 인스턴스가 실행 중이면 종료
  app.quit();
} else {
  // 두 번째 인스턴스가 실행되려고 할 때 기존 창에 포커스
  app.on('second-instance', () => {
    const windows = BrowserWindow.getAllWindows();
    if (windows.length > 0) {
      const win = windows[0];
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });
}

let mainWindow = null;

function createWindow() {
  const iconPath = path.join(__dirname, 'icon.png');
  
  // 화면 크기 가져오기
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
  
  mainWindow = new BrowserWindow({
    width: screenWidth,
    height: screenHeight,
    x: primaryDisplay.workArea.x,
    y: primaryDisplay.workArea.y,
    transparent: true,        // 투명 배경
    frame: false,             // 프레임 제거
    alwaysOnTop: true,        // 항상 위에 표시
    skipTaskbar: true,        // 작업 표시줄에서 숨김
    resizable: true,          // 크기 조절 가능
    movable: true,            // 이동 가능
    icon: fs.existsSync(iconPath) ? iconPath : undefined, // 아이콘 설정
    webPreferences: {
      nodeIntegration: false,        // 보안: Node.js API 직접 접근 차단
      contextIsolation: true,        // 보안: Context Isolation 활성화
      preload: path.join(__dirname, 'preload.js'), // Preload 스크립트 로드
    },
  });

  mainWindow.loadFile('index.html');
  
  // 마우스 이벤트 통과 설정 (선택적)
  // 필요시 renderer에서 'set-ignore-mouse-events' IPC로 제어 가능
  ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
    if (ignore) {
      // forward 옵션을 사용하여 마우스 위치 정보는 계속 받을 수 있게 함
      mainWindow.setIgnoreMouseEvents(true, options || { forward: true });
    } else {
      mainWindow.setIgnoreMouseEvents(false);
    }
  });

  // 앱 종료
  ipcMain.on('app-quit', () => {
    app.quit();
  });

  // 창 최소화
  ipcMain.on('window-minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win.isFullScreen()) {
      win.setFullScreen(false); // 전체화면을 먼저 끄고
    }
    win.minimize(); // 최소화 실행
  });

  // 전체화면 토글
  ipcMain.on('window-toggle-fullscreen', () => {
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
  });

  // 전체화면 상태 확인
  ipcMain.handle('is-fullscreen', () => {
    return mainWindow.isFullScreen();
  });

  // 마우스 이벤트 통과 토글 (다른 앱 사용 가능하도록)
  ipcMain.on('toggle-mouse-events', (event, ignore) => {
    if (ignore) {
      // 통과 모드 활성화: 마우스 이벤트 통과하되 forward로 이벤트 전달
      mainWindow.setIgnoreMouseEvents(true, { forward: true });
    } else {
      // 통과 모드 해제: 마우스 이벤트 정상 처리
      mainWindow.setIgnoreMouseEvents(false);
    }
  });

  // 파일 저장
  ipcMain.handle('save-file', async (event, data) => {
    try {
      const result = await dialog.showSaveDialog(mainWindow, {
        title: '마인드맵 저장',
        defaultPath: path.join(os.homedir(), 'mindmap.json'),
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (result.canceled) {
        return { success: false, cancelled: true };
      }

      // data는 이미 JSON 문자열로 전달됨
      fs.writeFileSync(result.filePath, data, 'utf8');
      
      // 최근 파일 경로 저장
      const recentFilePath = path.join(app.getPath('userData'), 'recent-file.json');
      fs.writeFileSync(recentFilePath, JSON.stringify({ path: result.filePath }), 'utf8');

      return { success: true, filePath: result.filePath };
    } catch (error) {
      console.error('파일 저장 오류:', error);
      return { success: false, error: error.message };
    }
  });

  // 파일 열기
  ipcMain.handle('open-file', async () => {
    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        title: '마인드맵 열기',
        defaultPath: os.homedir(),
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
      });

      if (result.canceled) {
        return { success: false, cancelled: true };
      }

      const filePath = result.filePaths[0];
      const data = fs.readFileSync(filePath, 'utf8');
      
      // 최근 파일 경로 저장
      const recentFilePath = path.join(app.getPath('userData'), 'recent-file.json');
      fs.writeFileSync(recentFilePath, JSON.stringify({ path: filePath }), 'utf8');

      // data는 JSON 문자열로 반환 (renderer.js에서 JSON.parse 함)
      return { success: true, data: data, filePath: filePath };
    } catch (error) {
      console.error('파일 열기 오류:', error);
      return { success: false, error: error.message };
    }
  });

  // 최근 파일 불러오기
  ipcMain.handle('load-recent-file', async () => {
    try {
      const recentFilePath = path.join(app.getPath('userData'), 'recent-file.json');
      if (!fs.existsSync(recentFilePath)) {
        return { success: false, noFile: true };
      }

      const recentFile = JSON.parse(fs.readFileSync(recentFilePath, 'utf8'));
      if (!fs.existsSync(recentFile.path)) {
        return { success: false, noFile: true };
      }

      const data = fs.readFileSync(recentFile.path, 'utf8');
      // data는 JSON 문자열로 반환 (renderer.js에서 JSON.parse 함)
      return { success: true, data: data, filePath: recentFile.path };
    } catch (error) {
      console.error('최근 파일 불러오기 오류:', error);
      return { success: false, error: error.message };
    }
  });

  // 자동 저장 (임시 파일)
  ipcMain.handle('auto-save', async (event, data) => {
    try {
      const autoSavePath = path.join(app.getPath('userData'), 'autosave.json');
      // data는 이미 JSON 문자열로 전달됨
      fs.writeFileSync(autoSavePath, data, 'utf8');
      return { success: true };
    } catch (error) {
      console.error('자동 저장 오류:', error);
      return { success: false, error: error.message };
    }
  });

  // 자동 저장 파일 불러오기
  ipcMain.handle('load-autosave', async () => {
    try {
      const autoSavePath = path.join(app.getPath('userData'), 'autosave.json');
      if (!fs.existsSync(autoSavePath)) {
        return { success: false, noFile: true };
      }

      const data = fs.readFileSync(autoSavePath, 'utf8');
      // data는 JSON 문자열로 반환 (renderer.js에서 JSON.parse 함)
      return { success: true, data: data };
    } catch (error) {
      console.error('자동 저장 불러오기 오류:', error);
      return { success: false, error: error.message };
    }
  });

  // 외부 링크 열기 (보안: shell.openExternal 사용)
  ipcMain.on('open-external', (event, url) => {
    if (url && typeof url === 'string') {
      shell.openExternal(url).catch(err => {
        console.error('외부 링크 열기 오류:', err);
      });
    }
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else if (mainWindow) {
    mainWindow.focus();
  }
});
