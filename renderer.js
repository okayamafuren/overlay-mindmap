// ==================== 전역 변수 ====================
// 모든 로그 전송 기능을 강제로 마비시킴 (버튼 생존을 위한 조치)
window.fetch = () => Promise.resolve();

// 보안: preload.js를 통해 노출된 안전한 API 사용
// window.api는 preload.js에서 contextBridge를 통해 제공됩니다

let canvas = null;
let ctx = null;

let nodes = [];
let connections = [];
let selectedNodes = [];
let selectedConnection = null; // 선택된 연결선
let history = [];
let historyIndex = -1;
let zoom = 1;
let panX = 0;
let panY = 0;
let isPanning = false;
let isConnecting = false;
let connectFrom = null;
let isContextMenuConnectMode = false; // 우클릭 컨텍스트 메뉴에서 시작한 연결 모드인지 구분
let dragging = null;
let dragOffset = { x: 0, y: 0 };
let hoveredNode = null;
let searchResults = [];
let searchIndex = -1;
let nextNodeId = 0;
let mousePos = { x: 0, y: 0 };
let isInitialized = false; // 초기화 중복 방지
let memorizationMode = false; // 암기 모드
let revealedNodes = new Set(); // 암기 모드에서 공개된 노드 ID
let mouseEventsIgnored = false; // 마우스 이벤트 통과 모드
let panelDragging = false; // 패널 드래그 중
let panelDragOffset = { x: 0, y: 0 }; // 패널 드래그 오프셋
let draggingPanel = null; // 현재 드래그 중인 패널
let boardColor = "#1a1a1a"; // 보드 배경색
let boardColorMode = "black"; // 보드 색상 모드: "black", "white", "transparent"
let boardOpacity = 0.1; // 보드 투명도 (초기값: 거의 투명)
let boardImage = null; // 보드 배경 이미지 (Data URL)
let boardImageObj = null; // 보드 배경 이미지 객체 (캐시)
let showGrid = true; // 그리드 표시 여부
let connectionLineStyle = 'solid'; // 연결선 스타일: 'solid', 'dashed', 'thick'
let selectedNode = null; // 컨텍스트 메뉴로 선택된 노드
let activeSubMenu = null; // 현재 열린 하위 메뉴: 'color', 'shape', 'line', null
let editingNode = null; // 현재 텍스트 편집 중인 노드
let isScaling = false; // S 키가 눌려있는지
let scalingNode = null; // 크기 조절 중인 노드
let initialNodeSize = 0; // 크기 조절 시작 시 초기 크기
let initialMousePos = { x: 0, y: 0 }; // 크기 조절 시작 시 마우스 위치

// ==================== 초기화 ====================
async function init() {
    // 중복 초기화 방지
    if (isInitialized) {
        console.warn("init() already called, skipping...");
        return;
    }
    isInitialized = true;
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:30',message:'init called',data:{readyState:document.readyState,windowWidth:window.innerWidth,windowHeight:window.innerHeight},timestamp:Date.now(),sessionId:'debug-session',runId:'timing',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    // Canvas 초기화
    canvas = document.getElementById("canvas");
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:43',message:'canvas lookup',data:{canvasExists:!!canvas,readyState:document.readyState},timestamp:Date.now(),sessionId:'debug-session',runId:'timing',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    if (!canvas) {
        console.error("Canvas element not found!");
        isInitialized = false; // 실패 시 플래그 재설정
        return;
    }
    ctx = canvas.getContext("2d");
    if (!ctx) {
        console.error("Could not get 2d context!");
        isInitialized = false;
        return;
    }
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:56',message:'before resize',data:{canvasWidth:canvas.width,canvasHeight:canvas.height,windowWidth:window.innerWidth,windowHeight:window.innerHeight},timestamp:Date.now(),sessionId:'debug-session',runId:'timing',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    resize();
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:64',message:'after resize',data:{canvasWidth:canvas.width,canvasHeight:canvas.height},timestamp:Date.now(),sessionId:'debug-session',runId:'timing',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:53',message:'before setupEventListeners',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    setupEventListeners();
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:60',message:'before setupUI',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    try {
        setupUI();
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:67',message:'setupUI completed',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
    } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:70',message:'setupUI error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        console.error('setupUI error:', error);
    }
    
    // 최근 파일 또는 자동 저장 파일 불러오기 시도
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:81',message:'before loadRecentOrAutosave',data:{apiExists:!!window.api},timestamp:Date.now(),sessionId:'debug-session',runId:'timing',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    try {
        await loadRecentOrAutosave();
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:86',message:'after loadRecentOrAutosave',data:{nodesCount:nodes.length},timestamp:Date.now(),sessionId:'debug-session',runId:'timing',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
    } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:89',message:'loadRecentOrAutosave error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'timing',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        console.error('loadRecentOrAutosave error:', error);
    }
    
    // 노드가 없으면 초기 노드 생성
    if (nodes.length === 0) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:96',message:'calling createInitialNode',data:{canvasWidth:canvas?.width,canvasHeight:canvas?.height},timestamp:Date.now(),sessionId:'debug-session',runId:'timing',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        createInitialNode();
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:100',message:'after createInitialNode',data:{nodesCount:nodes.length},timestamp:Date.now(),sessionId:'debug-session',runId:'timing',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
    }
    
    draw();
    saveState();
    updateStatus();
    
    // 자동 저장 시작
    startAutoSave();
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:54',message:'init completed',data:{nodesCount:nodes.length,canvasWidth:canvas?.width,canvasHeight:canvas?.height,setupUICalled:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    // 초기화 강제: 0.5초 후 캔버스 크기 조정 및 첫 노드 생성
    setTimeout(() => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:107',message:'setTimeout callback called',data:{canvasExists:!!canvas,canvasWidth:canvas?.width,canvasHeight:canvas?.height,windowWidth:window.innerWidth,windowHeight:window.innerHeight,nodesCount:nodes.length},timestamp:Date.now(),sessionId:'debug-session',runId:'timing',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        resize();
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:110',message:'after setTimeout resize',data:{canvasWidth:canvas?.width,canvasHeight:canvas?.height},timestamp:Date.now(),sessionId:'debug-session',runId:'timing',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        addNodeAtCenter();
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:113',message:'after setTimeout addNodeAtCenter',data:{nodesCount:nodes.length},timestamp:Date.now(),sessionId:'debug-session',runId:'timing',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
    }, 500);
}

function resize() {
    if (!canvas) return;
    
    // 실제 화면 크기 가져오기 (디바이스 픽셀 비율 고려)
    const devicePixelRatio = window.devicePixelRatio || 1;
    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;
    
    const oldWidth = canvas.width;
    const oldHeight = canvas.height;
    
    // 캔버스 크기를 화면 크기에 맞춤 (뭉개지지 않도록)
    canvas.width = displayWidth;
    canvas.height = displayHeight;
    
    // 캔버스 크기 변경 시 그리기
    if (oldWidth !== canvas.width || oldHeight !== canvas.height) {
        // requestAnimationFrame을 사용하여 부드러운 리사이즈
        requestAnimationFrame(() => {
            try {
                draw();
            } catch (error) {
                console.error('draw error in resize:', error);
            }
        });
    }
}

function createInitialNode() {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:161',message:'createInitialNode called',data:{canvasExists:!!canvas,canvasWidth:canvas?.width,canvasHeight:canvas?.height,windowWidth:window.innerWidth,windowHeight:window.innerHeight},timestamp:Date.now(),sessionId:'debug-session',runId:'timing',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    if (!canvas) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:165',message:'createInitialNode: canvas is null',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'timing',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        return;
    }
    // 화면 중앙에 노드 생성 (월드 좌표계 기준)
    // draw() 함수에서 ctx.translate(panX, panY)와 ctx.scale(zoom, zoom)를 사용하므로
    // 노드는 월드 좌표로 저장되어야 합니다.
    // canvas.width가 0일 경우 window.innerWidth 사용
    const canvasWidth = canvas.width || window.innerWidth || 800;
    const canvasHeight = canvas.height || window.innerHeight || 600;
    const centerX = (canvasWidth / 2 - panX) / zoom;
    const centerY = (canvasHeight / 2 - panY) / zoom;
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:175',message:'createInitialNode: coordinates calculated',data:{canvasWidth,canvasHeight,centerX,centerY,panX,panY,zoom},timestamp:Date.now(),sessionId:'debug-session',runId:'timing',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    nodes = [{
        id: nextNodeId++,
        x: centerX,
        y: centerY,
        text: "중심",
        color: "#ffffff",
        size: 35,
        fontSize: 14,
        shape: "circle",
        borderWidth: 2,
        opacity: 0.9,
        icon: "",
        note: "",
        tags: [],
        priority: 3,
        progress: 0,
        link: "",
        parent: null
    }];
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:200',message:'createInitialNode: node created',data:{nodesCount:nodes.length,nodeId:nodes[0]?.id,nodeX:nodes[0]?.x,nodeY:nodes[0]?.y},timestamp:Date.now(),sessionId:'debug-session',runId:'timing',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    updateNodeCount();
}

// ==================== 이벤트 리스너 ====================
// 중복 방지를 위한 플래그 및 핸들러 참조
let eventListenersSetup = false;
let resizeHandlerRef = null;

function setupEventListeners() {
    if (!canvas) return;
    
    // 중복 방지: 이미 설정되었으면 스킵
    if (eventListenersSetup) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:118',message:'setupEventListeners: already setup, skipping',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        return;
    }
    
    resizeHandlerRef = () => {
        resize(); // resize() 내부에서 이미 draw() 호출
    };
    
    window.addEventListener("resize", resizeHandlerRef);

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("dblclick", handleDoubleClick);
    canvas.addEventListener("contextmenu", handleContextMenu);
    canvas.addEventListener("wheel", handleWheel);

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    
    eventListenersSetup = true;
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:146',message:'setupEventListeners: completed',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
}

// 이벤트 리스너 추적 (중복 방지)
const eventListeners = new Map();
let setupUICalled = false; // 중복 방지

function setupUI() {
    // 중복 방지
    if (setupUICalled) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:181',message:'setupUI: already called, skipping',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        return;
    }
    setupUICalled = true;
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:192',message:'setupUI called',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    // 안전하게 요소 가져오기 및 이벤트 리스너 추가 (중복 방지)
    const safeAddListener = (id, event, handler) => {
        const el = document.getElementById(id);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:142',message:'safeAddListener',data:{id,event,elementFound:!!el},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        if (!el) {
            console.warn(`Element not found: ${id}`);
            return;
        }
        
        // 중복 체크
        const key = `${id}-${event}`;
        if (eventListeners.has(key)) {
            // 기존 리스너 제거 후 새로 추가
            const oldHandler = eventListeners.get(key);
            el.removeEventListener(event, oldHandler);
        }
        
        // 브라우저 줌에 안전한 핸들러 래퍼 (IPC 버튼에만 적용)
        const isIPCButton = id === 'btn-minimize' || id === 'btn-close' || id === 'btn-fullscreen';
        const wrappedHandler = isIPCButton ? (e) => {
            // 전체화면 모드 감지 (동기적으로 빠르게 확인)
            const isFullscreen = !!document.fullscreenElement || 
                                !!document.webkitFullscreenElement || 
                                !!document.mozFullScreenElement || 
                                !!document.msFullscreenElement;
            
            // 전체화면 모드에서는 검증 건너뛰고 바로 실행
            if (isFullscreen) {
                handler(e);
                return;
            }
            
            // 일반 모드에서는 실제 클릭된 요소 확인 (브라우저 줌 보정)
            if (e && e.clientX !== undefined && e.clientY !== undefined) {
                try {
                    const actualElement = document.elementFromPoint(e.clientX, e.clientY);
                    // 요소가 버튼 내부에 있는지 확인
                    if (actualElement && (el.contains(actualElement) || actualElement === el || el.contains(actualElement))) {
                        handler(e);
                    }
                } catch (error) {
                    // elementFromPoint 실패 시에도 실행 (안전장치)
                    handler(e);
                }
            } else {
                handler(e);
            }
        } : handler;
        
        eventListeners.set(key, wrappedHandler);
        el.addEventListener(event, wrappedHandler);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:155',message:'event listener added',data:{id,event},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
    };
    
    // 툴바 버튼 (HTML 순서에 맞춰 정렬)
    // 첫 번째 섹션: 기본 편집
    const addNodeHandler = () => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:162',message:'btn-add clicked',data:{nodesLength:nodes.length,canvasExists:!!canvas},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        addNodeAtCenter();
    };
    safeAddListener("btn-add", "click", addNodeHandler);
    
    // 연결 버튼 설정
    safeAddListener("btn-connect", "click", toggleConnectMode);
    safeAddListener("btn-delete", "click", deleteSelected);
    safeAddListener("btn-undo", "click", undo);
    safeAddListener("btn-redo", "click", redo);
    safeAddListener("btn-save", "click", saveToFile);
    safeAddListener("btn-open", "click", openFile);
    
    // 두 번째 섹션: 줌
    safeAddListener("btn-zoom-in", "click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            if (typeof zoom !== 'undefined' && zoom !== null && typeof setZoom === 'function') {
                setZoom(zoom * 1.2);
            }
        } catch (error) {
            console.error('Zoom in button error:', error);
        }
    });
    safeAddListener("btn-zoom-out", "click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            if (typeof zoom !== 'undefined' && zoom !== null && typeof setZoom === 'function') {
                setZoom(zoom * 0.8);
            }
        } catch (error) {
            console.error('Zoom out button error:', error);
        }
    });
    safeAddListener("btn-zoom-fit", "click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            zoomToFit();
        } catch (error) {
            console.error('Zoom fit button error:', error);
        }
    });
    
    // 세 번째 섹션: 검색 (아래에서 처리)
    
    // 네 번째 섹션 (toolbar-right): 고급 기능
    safeAddListener("btn-mouse-toggle", "click", toggleMouseEvents);
    safeAddListener("btn-memorization", "click", toggleMemorizationMode);
    safeAddListener("btn-grid-toggle", "click", toggleGrid);
    // 그리드 버튼 초기 상태 설정
    const gridBtn = document.getElementById("btn-grid-toggle");
    if (gridBtn && showGrid) {
        gridBtn.classList.add("active");
    }
    // 보드 색상 토글 버튼
    safeAddListener("btn-board-color", "click", toggleBoardColor);
    // 초기 아이콘 설정
    updateBoardColorIcon();
    // 보드 투명도 슬라이더
    const boardOpacitySlider = document.getElementById("board-opacity-slider");
    const boardOpacityValue = document.getElementById("board-opacity-value");
    if (boardOpacitySlider) {
        boardOpacitySlider.addEventListener("input", (e) => {
            boardOpacity = parseFloat(e.target.value) / 100;
            if (boardOpacityValue) {
                boardOpacityValue.textContent = Math.round(boardOpacity * 100) + "%";
            }
            // 즉시 반영을 위해 draw() 먼저 호출
            if (canvas && ctx) {
                draw();
            }
            saveState();
        });
        boardOpacitySlider.value = boardOpacity * 100;
        if (boardOpacityValue) {
            boardOpacityValue.textContent = Math.round(boardOpacity * 100) + "%";
        }
    }
    // 보드 설정 버튼
    safeAddListener("btn-board", "click", openBoardPanel);
    // IPC 버튼들은 mousedown 이벤트도 추가 (브라우저 줌에 더 안전)
    const addIPCButtonListeners = (id, handler) => {
        const el = document.getElementById(id);
        if (!el) return;
        
        // click 이벤트
        safeAddListener(id, "click", handler);
        
        // mousedown 이벤트 (브라우저 줌에 더 안정적)
        const mousedownHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // 전체화면 모드 감지 (동기적으로 빠르게 확인)
            const isFullscreen = !!document.fullscreenElement || 
                                !!document.webkitFullscreenElement || 
                                !!document.mozFullScreenElement || 
                                !!document.msFullscreenElement;
            
            // 전체화면 모드에서는 검증 완화 (바로 실행)
            if (isFullscreen) {
                handler(e);
                return;
            }
            
            // 일반 모드에서는 실제 클릭된 요소 확인
            try {
                const actualElement = document.elementFromPoint(e.clientX, e.clientY);
                if (actualElement && (el.contains(actualElement) || actualElement === el)) {
                    handler(e);
                }
            } catch (error) {
                // elementFromPoint 실패 시에도 실행 (안전장치)
                handler(e);
            }
        };
        el.addEventListener("mousedown", mousedownHandler);
        
        // mouseup 이벤트로도 처리 (더블 클릭 방지)
        const mouseupHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };
        el.addEventListener("mouseup", mouseupHandler);
        
        // 전체화면 모드 변경 감지하여 이벤트 리스너 재등록
        const fullscreenChangeHandler = () => {
            // 전체화면 모드 변경 시 이벤트 리스너 재등록 (필요시)
            // 현재는 자동으로 처리되므로 주석 처리
        };
        document.addEventListener('fullscreenchange', fullscreenChangeHandler);
        document.addEventListener('webkitfullscreenchange', fullscreenChangeHandler);
        document.addEventListener('mozfullscreenchange', fullscreenChangeHandler);
        document.addEventListener('MSFullscreenChange', fullscreenChangeHandler);
    };
    
    addIPCButtonListeners("btn-fullscreen", toggleFullscreen);
    safeAddListener("btn-help", "click", toggleHelpPanel);
    addIPCButtonListeners("btn-minimize", minimizeWindow);
    addIPCButtonListeners("btn-close", closeApp);
    
    // HTML에 없는 버튼들 (기존 기능 유지)
    // safeAddListener("btn-draw", "click", toggleDrawingMode);

    // 줌 슬라이더
    const zoomSlider = document.getElementById("zoom-slider");
    if (zoomSlider) {
        zoomSlider.addEventListener("input", (e) => {
            setZoom(e.target.value / 100);
        });
    }

    // 검색
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
        searchInput.addEventListener("input", handleSearch);
    }
    safeAddListener("btn-search-prev", "click", () => navigateSearch(-1));
    safeAddListener("btn-search-next", "click", () => navigateSearch(1));
    
    // 정렬 기능 설정
    setupAlignMenu();

    // 노드 패널
    safeAddListener("close-panel", "click", closeNodePanel);
    safeAddListener("save-node", "click", saveNodeProperties);
    safeAddListener("cancel-edit", "click", closeNodePanel);

    // 노드 속성 입력
    try {
        setupNodePropertyInputs();
    } catch (e) {
        console.error('setupNodePropertyInputs error:', e);
    }

    
    // 패널 드래그 기능 추가
    try {
        setupPanelDrag();
    } catch (e) {
        console.error('setupPanelDrag error:', e);
    }
    
    // 연결선 패널 설정
    try {
        setupConnectionPanel();
    } catch (e) {
        console.error('setupConnectionPanel error:', e);
    }
    
    // 노드 패널 확장 기능
    try {
        setupNodePanelExpand();
    } catch (e) {
        console.error('setupNodePanelExpand error:', e);
    }
    
    // 도움말 패널 설정
    try {
        setupHelpPanel();
    } catch (e) {
        console.error('setupHelpPanel error:', e);
    }
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:281',message:'setupUI completed successfully',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run6',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
}

// 노드 패널 확장 기능
function setupNodePanelExpand() {
    const expandBtn = document.getElementById("node-panel-expand");
    const panel = document.getElementById("node-panel");
    
    if (expandBtn && panel) {
        expandBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            panel.classList.toggle("expanded");
            expandBtn.textContent = panel.classList.contains("expanded") ? "⊟" : "⛶";
        });
    }
}

// 패널 드래그 기능
function setupPanelDrag() {
    // 노드 패널과 도움말 패널, 연결선 패널 모두 드래그 가능하도록
    const panels = [
        document.getElementById("node-panel"),
        document.getElementById("help-panel"),
        document.getElementById("board-panel"),
        document.getElementById("connection-panel")
    ].filter(p => p !== null);
    
    panels.forEach(panel => {
        const panelHeader = panel.querySelector(".panel-header");
        const panelContent = panel.querySelector(".panel-content");
        
        // 패널 헤더 드래그
        if (panelHeader) {
            panelHeader.style.cursor = "move";
            panelHeader.addEventListener("mousedown", (e) => {
                // 닫기 버튼이나 확장 버튼 클릭 시 드래그 방지
                if (e.target.classList.contains("panel-close") || 
                    e.target.classList.contains("panel-expand") ||
                    e.target.closest(".panel-close") ||
                    e.target.closest(".panel-expand")) {
                    return;
                }
                panelDragging = true;
                draggingPanel = panel;
                const rect = panel.getBoundingClientRect();
                panelDragOffset = {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                };
                e.preventDefault();
                e.stopPropagation();
            });
        }
        
        // 패널 여백(패널 본문의 빈 공간) 드래그
        if (panelContent) {
            panelContent.addEventListener("mousedown", (e) => {
                // 입력 필드나 버튼 클릭 시 드래그 방지
                if (e.target.tagName === "INPUT" || 
                    e.target.tagName === "TEXTAREA" ||
                    e.target.tagName === "SELECT" ||
                    e.target.tagName === "BUTTON" ||
                    e.target.closest("button") ||
                    e.target.closest("input") ||
                    e.target.closest("textarea") ||
                    e.target.closest("select")) {
                    return;
                }
                // 빈 공간 클릭 시 드래그 시작
                panelDragging = true;
                draggingPanel = panel;
                const rect = panel.getBoundingClientRect();
                panelDragOffset = {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                };
                e.preventDefault();
                e.stopPropagation();
            });
        }
    });
    
    // 패널 드래그 이벤트는 document 레벨에서 처리 (canvas 이벤트보다 우선)
    const panelMouseMoveHandler = (e) => {
        if (panelDragging && draggingPanel) {
            e.preventDefault();
            e.stopPropagation();
            draggingPanel.style.left = (e.clientX - panelDragOffset.x) + "px";
            draggingPanel.style.top = (e.clientY - panelDragOffset.y) + "px";
            draggingPanel.style.right = "auto";
            draggingPanel.style.bottom = "auto";
        }
    };
    
    const panelMouseUpHandler = (e) => {
        if (panelDragging) {
            e.preventDefault();
            e.stopPropagation();
            panelDragging = false;
            draggingPanel = null;
        }
    };
    
    // 이벤트 리스너 추가 (캡처 단계에서 먼저 처리)
    document.addEventListener("mousemove", panelMouseMoveHandler, true);
    document.addEventListener("mouseup", panelMouseUpHandler, true);
}

function setupNodePropertyInputs() {
    const inputs = {
        "node-text": (val) => { 
            if (selectedNodes[0]) {
                selectedNodes[0].text = val;
                updateNodePanel();
            }
        },
        "node-color": (val) => { 
            if (selectedNodes[0]) {
                selectedNodes[0].color = val;
            }
        },
        "node-size": (val) => { 
            if (selectedNodes[0]) {
                const size = parseInt(val) || 30;
                selectedNodes[0].size = size;
                const sizeValueEl = document.getElementById("node-size-value");
                if (sizeValueEl) sizeValueEl.textContent = size;
            }
        },
        "node-font-size": (val) => { 
            if (selectedNodes[0]) {
                const fontSize = parseInt(val) || 14;
                selectedNodes[0].fontSize = fontSize;
                const fontSizeValueEl = document.getElementById("node-font-size-value");
                if (fontSizeValueEl) fontSizeValueEl.textContent = fontSize;
            }
        },
        "node-shape": (val) => { 
            if (selectedNodes[0]) {
                selectedNodes[0].shape = val;
            }
        },
        "node-border": (val) => { 
            if (selectedNodes[0]) {
                const border = parseInt(val) || 2;
                selectedNodes[0].borderWidth = border;
                const borderValueEl = document.getElementById("node-border-value");
                if (borderValueEl) borderValueEl.textContent = border;
            }
        },
        "node-opacity": (val) => { 
            if (selectedNodes[0]) {
                const opacity = parseInt(val) / 100 || 0.9;
                selectedNodes[0].opacity = opacity;
                const opacityValueEl = document.getElementById("node-opacity-value");
                if (opacityValueEl) opacityValueEl.textContent = Math.round(opacity * 100) + "%";
            }
        },
        "node-icon": (val) => { 
            if (selectedNodes[0]) {
                selectedNodes[0].icon = val;
            }
        },
        "node-note": (val) => { 
            if (selectedNodes[0]) {
                selectedNodes[0].note = val;
            }
        },
        "node-tags": (val) => { 
            if (selectedNodes[0]) {
                selectedNodes[0].tags = val.split(",").map(t => t.trim()).filter(t => t);
            }
        },
        "node-priority": (val) => { 
            if (selectedNodes[0]) {
                const priority = parseInt(val) || 3;
                selectedNodes[0].priority = priority;
                const priorityValueEl = document.getElementById("node-priority-value");
                if (priorityValueEl) priorityValueEl.textContent = priority;
            }
        },
        "node-progress": (val) => { 
            if (selectedNodes[0]) {
                const progress = parseInt(val) || 0;
                selectedNodes[0].progress = progress;
                const progressValueEl = document.getElementById("node-progress-value");
                if (progressValueEl) progressValueEl.textContent = progress + "%";
            }
        },
        "node-link": (val) => { 
            if (selectedNodes[0]) {
                selectedNodes[0].link = val;
            }
        }
    };

    Object.entries(inputs).forEach(([id, handler]) => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("input", (e) => {
                handler(e.target.value);
                draw();
            });
        }
    });
    
    // 노드 이미지 불러오기
    const imageLoadBtn = document.getElementById("node-image-load");
    if (imageLoadBtn) {
        imageLoadBtn.addEventListener("click", () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (selectedNodes[0]) {
                        selectedNodes[0].image = e.target.result;
                        selectedNodes[0]._imageObj = null; // 새 이미지 로드를 위해 초기화
                        
                        // 이미지 원본 비율 계산
                        const img = new Image();
                        img.onload = () => {
                            if (selectedNodes[0] && !selectedNodes[0].imageAspectRatio) {
                                selectedNodes[0].imageAspectRatio = img.width / img.height;
                                // nodes 배열에서도 업데이트
                                const nodeIndex = nodes.findIndex(n => n.id === selectedNodes[0].id);
                                if (nodeIndex !== -1) {
                                    nodes[nodeIndex].imageAspectRatio = selectedNodes[0].imageAspectRatio;
                                }
                                updateNodePanel();
                                saveState();
                                draw();
                            }
                        };
                        img.src = e.target.result;
                        
                        updateNodePanel();
                        saveState();
                        draw();
                    }
                };
                reader.readAsDataURL(file);
            };
            input.click();
        });
    }
    
    // 노드 이미지 제거
    const imageRemoveBtn = document.getElementById("node-image-remove");
    if (imageRemoveBtn) {
        imageRemoveBtn.addEventListener("click", () => {
            if (selectedNodes[0]) {
                selectedNodes[0].image = null;
                selectedNodes[0]._imageObj = null;
                selectedNodes[0].imageAspectRatio = 1.0; // 기본값으로 리셋
                updateNodePanel();
                saveState();
                draw();
            }
        });
    }
    
    // 이미지 비율 조절
    const imageAspectRatioSlider = document.getElementById("node-image-aspect-ratio");
    const imageAspectRatioValue = document.getElementById("node-image-aspect-ratio-value");
    if (imageAspectRatioSlider && imageAspectRatioValue) {
        imageAspectRatioSlider.addEventListener("input", (e) => {
            if (selectedNodes[0]) {
                const ratio = parseFloat(e.target.value);
                selectedNodes[0].imageAspectRatio = ratio;
                imageAspectRatioValue.textContent = ratio.toFixed(1);
                
                // nodes 배열에서도 업데이트
                const nodeIndex = nodes.findIndex(n => n.id === selectedNodes[0].id);
                if (nodeIndex !== -1) {
                    nodes[nodeIndex].imageAspectRatio = ratio;
                }
                
                // 이미지 객체 초기화하여 다시 그리기
                if (selectedNodes[0]._imageObj) {
                    selectedNodes[0]._imageObj = null;
                }
                
                saveState();
                draw();
            }
        });
    }
}

// ==================== 마우스 이벤트 ====================
function getCanvasPos(e) {
    if (!canvas || !e) return { x: 0, y: 0 };
    const r = canvas.getBoundingClientRect();
    // 화면 좌표를 월드 좌표로 변환
    return {
        x: (e.clientX - r.left - panX) / zoom,
        y: (e.clientY - r.top - panY) / zoom
    };
}

// 월드 좌표를 화면 좌표로 변환
function worldToScreen(worldX, worldY) {
    if (!canvas) return { x: 0, y: 0 };
    const r = canvas.getBoundingClientRect();
    return {
        x: r.left + worldX * zoom + panX,
        y: r.top + worldY * zoom + panY
    };
}

function handleMouseDown(e) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:314',message:'handleMouseDown called',data:{button:e.button,ctrlKey:e.ctrlKey,shiftKey:e.shiftKey,target:e.target?.tagName,panelDragging},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    
    // 편집 중인 input 요소 클릭 시 무시
    if (e.target.tagName === 'INPUT' && e.target.classList.contains('node-text-edit')) {
        return;
    }
    
    // 편집 중이면 편집 완료 (다른 곳 클릭 시)
    if (editingNode && e.target.tagName !== 'INPUT') {
        finishNodeTextEdit(true);
    }
    
    // 패널 드래그 중이면 캔버스 이벤트 무시
    if (panelDragging) {
        return;
    }
    
    // 컨텍스트 툴바 클릭 시 이벤트 전파 중단
    if (e.target.closest('.context-toolbar, .context-submenu, .context-btn, .context-color-btn, .context-shape-btn, .context-line-btn, .context-border-btn')) {
        e.stopPropagation();
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
    }
    
    // 패널이나 툴바 클릭 시 이벤트 전파 중단
    if (e.target.closest('.node-panel, .toolbar, .context-menu, .help-panel')) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:317',message:'handleMouseDown: clicked on panel/toolbar',data:{target:e.target?.className},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        return;
    }
    
    e.preventDefault();
    const pos = getCanvasPos(e);
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:322',message:'handleMouseDown: canvas pos',data:{posX:pos.x,posY:pos.y,zoom,panX,panY},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
        // 중간 버튼 또는 Ctrl+왼쪽: 팬
        isPanning = true;
        dragOffset = { x: e.clientX - panX, y: e.clientY - panY };
        if (canvas) canvas.style.cursor = "grabbing";
        return;
    }

    if (e.button === 2) {
        // 우클릭은 컨텍스트 메뉴에서 처리
        return;
    }

    // 연결 모드
    if (isConnecting) {
        const node = hitTest(pos.x, pos.y);
        if (node) {
            if (connectFrom && node !== connectFrom && connectFrom.id !== undefined && node.id !== undefined) {
                // 연결 생성
                createConnection(connectFrom.id, node.id);
                
                // 우클릭 컨텍스트 메뉴에서 시작한 연결 모드면 한 번만 연결하고 종료
                if (isContextMenuConnectMode) {
                    isConnecting = false;
                    isContextMenuConnectMode = false;
                    connectFrom = null;
                    const btn = document.getElementById("btn-connect");
                    if (btn) btn.classList.remove("active");
                    if (canvas) {
                        canvas.classList.remove("connecting");
                        canvas.style.cursor = "default";
                    }
                } else {
                    // 툴바에서 시작한 연결 모드면 계속 연결 가능하도록 유지
                    connectFrom = node;
                }
                
                saveState();
                draw();
            } else if (!connectFrom) {
                // connectFrom이 없으면 현재 노드를 시작점으로 설정
                connectFrom = node;
                draw();
            }
        }
        // 빈 공간 클릭 시에도 연결 모드 유지 (아무 동작 안 함)
        return;
    }

    // 먼저 노드 클릭 확인
    const node = hitTest(pos.x, pos.y);
    
    // 노드가 클릭되지 않았으면 연결선 클릭 확인
    let clickedConnection = null;
    if (!node && !isConnecting) {
        clickedConnection = hitTestConnection(pos.x, pos.y);
    }
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:352',message:'handleMouseDown: hitTest result',data:{nodeFound:!!node,nodeId:node?.id,nodeCount:nodes.length,connectionFound:!!clickedConnection},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    
    // 연결선 클릭 처리
    if (clickedConnection) {
        selectedConnection = clickedConnection;
        clearSelection(); // 노드 선택 해제
        openConnectionPanel(clickedConnection);
        draw();
        return;
    }
    
    if (node) {
        // 암기 모드에서 노드 클릭 시 공개
        if (memorizationMode) {
            revealedNodes.add(node.id);
        }
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:359',message:'handleMouseDown: node clicked',data:{nodeId:node.id,shiftKey:e.shiftKey,selectedBefore:selectedNodes.includes(node)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        
        // S 키가 눌려있으면 크기 조절 모드
        if (isScaling) {
            scalingNode = node;
            initialNodeSize = node.size || 30;
            initialMousePos = { x: e.clientX, y: e.clientY };
            if (canvas) canvas.style.cursor = "ns-resize";
            return;
        }
        
        if (e.shiftKey) {
            // Shift+클릭: 다중 선택
            toggleSelection(node);
        } else {
            // 단일 선택 및 드래그
            if (!selectedNodes.includes(node)) {
                selectNode(node);
            }
            dragging = node;
            dragOffset = { x: pos.x - node.x, y: pos.y - node.y };
            
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:368',message:'handleMouseDown: dragging set',data:{draggingId:dragging?.id,dragOffset},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
        }
    } else {
        // 빈 공간 클릭: 선택 해제
        if (!e.shiftKey) {
            clearSelection();
        }
        // 빈 공간 드래그: 팬
        if (e.button === 0 && !e.ctrlKey) {
            isPanning = true;
            dragOffset = { x: e.clientX - panX, y: e.clientY - panY };
        }
    }
}

function handleMouseMove(e) {
    // 패널 드래그 중이면 캔버스 이벤트 무시
    if (panelDragging) return;
    
    const pos = getCanvasPos(e);
    mousePos = pos;
    updatePositionInfo(pos);

    if (isPanning) {
        panX = e.clientX - dragOffset.x;
        panY = e.clientY - dragOffset.y;
        draw();
        return;
    }

    // 크기 조절 중
    if (scalingNode) {
        // 마우스 이동 거리 계산 (화면 좌표 기준)
        const deltaX = e.clientX - initialMousePos.x;
        const deltaY = e.clientY - initialMousePos.y;
        // 대각선 거리 사용 (Blender 스타일)
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        // 마우스 이동 방향에 따라 크기 조절
        // 아래로/오른쪽 드래그: 확대, 위로/왼쪽 드래그: 축소
        const direction = (deltaY + deltaX) > 0 ? 1 : -1;
        // 줌 레벨을 고려한 스케일 팩터 (줌이 클수록 더 민감하게)
        const scaleFactor = (distance / 100) * zoom;
        const newSize = Math.max(10, Math.min(200, initialNodeSize + direction * scaleFactor * 5));
        
        scalingNode.size = Math.round(newSize);
        
        // nodes 배열에서도 업데이트
        const nodeIndex = nodes.findIndex(n => n.id === scalingNode.id);
        if (nodeIndex !== -1) {
            nodes[nodeIndex].size = scalingNode.size;
        }
        // selectedNodes도 업데이트
        const selectedIndex = selectedNodes.findIndex(n => n.id === scalingNode.id);
        if (selectedIndex !== -1) {
            selectedNodes[selectedIndex].size = scalingNode.size;
        }
        
        draw();
        return;
    }

    if (dragging) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:429',message:'handleMouseMove: dragging node',data:{draggingId:dragging?.id,newX:pos.x - dragOffset.x,newY:pos.y - dragOffset.y},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        dragging.x = pos.x - dragOffset.x;
        dragging.y = pos.y - dragOffset.y;
        draw();
        return;
    }

    // 호버 효과
    const node = hitTest(pos.x, pos.y);
    if (node !== hoveredNode) {
        hoveredNode = node;
        
        // 암기 모드에서 노드에 호버하면 공개
        if (memorizationMode && node) {
            revealedNodes.add(node.id);
        }
        
        // S 키가 눌려있으면 크기 조절 커서, 아니면 기본 커서
        if (canvas) {
            if (isScaling) {
                canvas.style.cursor = node ? "ns-resize" : "default";
            } else {
                canvas.style.cursor = node ? "move" : (isConnecting ? "crosshair" : "default");
            }
        }
        draw();
    } else if (isConnecting) {
        draw();
    }
}

function handleMouseUp(e) {
    // 크기 조절 종료
    if (scalingNode) {
        saveState();
        scalingNode = null;
        initialNodeSize = 0;
        initialMousePos = { x: 0, y: 0 };
        // 커서 복원
        if (canvas) {
            const pos = getCanvasPos(e);
            const node = hitTest(pos.x, pos.y);
            if (isScaling) {
                canvas.style.cursor = node ? "ns-resize" : "default";
            } else {
                canvas.style.cursor = node ? "move" : (isConnecting ? "crosshair" : "default");
            }
        }
        return;
    }
    
    if (isPanning || dragging) {
        if (dragging) {
            saveState();
        }
        isPanning = false;
        dragging = null;
        if (canvas) canvas.style.cursor = "default";
    }
}

function handleMouseLeave() {
    isPanning = false;
    dragging = null;
    hoveredNode = null;
    if (canvas) canvas.style.cursor = "default";
}

function handleDoubleClick(e) {
    // 패널이나 툴바 더블클릭 시 무시
    if (e.target.closest('.node-panel, .toolbar, .context-menu')) {
        return;
    }
    
    // 편집 중인 input 요소 클릭 시 무시
    if (e.target.tagName === 'INPUT' && e.target.classList.contains('node-text-edit')) {
        return;
    }
    
    e.preventDefault();
    const pos = getCanvasPos(e);
    const node = hitTest(pos.x, pos.y);
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:471',message:'handleDoubleClick',data:{nodeFound:!!node,nodeId:node?.id,ctrlKey:e.ctrlKey},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    if (node) {
        // Ctrl+더블클릭: 링크 열기
        if (node.link && e.ctrlKey) {
            openNodeLink(node);
        } else {
            // 텍스트 영역인지 확인: 텍스트가 있고 이미지가 없으며, 더블클릭 위치가 텍스트 위인지 확인
            const hasText = !node.image && node.text && node.text.trim() !== '';
            let isTextArea = false;
            
            if (hasText && ctx) {
                // 텍스트 크기 측정
                ctx.save();
                ctx.font = `bold ${node.fontSize || 14}px sans-serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                
                let text = node.text;
                if (node.icon) {
                    text = node.icon + " " + text;
                }
                
                const textMetrics = ctx.measureText(text);
                const textWidth = textMetrics.width;
                const textHeight = (node.fontSize || 14) * 1.2; // 폰트 크기의 1.2배를 높이로 사용
                
                // 텍스트 영역 (노드 중앙 기준)
                const textLeft = node.x - textWidth / 2;
                const textRight = node.x + textWidth / 2;
                const textTop = node.y - textHeight / 2;
                const textBottom = node.y + textHeight / 2;
                
                // 더블클릭 위치가 텍스트 영역 안인지 확인
                isTextArea = pos.x >= textLeft && pos.x <= textRight && 
                            pos.y >= textTop && pos.y <= textBottom;
                
                ctx.restore();
            }
            
            if (isTextArea) {
                // 텍스트 영역 더블클릭: 인라인 텍스트 편집 시작
                startNodeTextEdit(node);
            } else {
                // 텍스트가 아닌 영역 더블클릭: 속성 패널 열기
                openNodePanel(node);
            }
        }
    } else {
        // 빈 공간 더블클릭: 새 노드 추가
        const newNode = addNode(pos.x, pos.y, "새 노드");
        if (newNode) {
            setTimeout(() => {
                startNodeTextEdit(newNode);
            }, 100);
        }
    }
}

function handleContextMenu(e) {
    // 기본 브라우저 컨텍스트 메뉴 완전히 차단
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    const pos = getCanvasPos(e);
    const node = hitTest(pos.x, pos.y);
    
    if (node) {
        // 노드 선택 (선 연결 기능 비활성화)
        selectedNode = node;
        if (!selectedNodes.includes(node)) {
            selectNode(node);
        }
        activeSubMenu = null;
        
        // 마우스 화면 좌표를 직접 사용 (가장 안정적)
        // e.clientX, e.clientY는 화면 기준 절대 좌표이므로 position: fixed 메뉴에 바로 사용 가능
        const toolbarX = e.clientX;
        const toolbarY = e.clientY - 60; // 마우스 위치 위에 표시
        
        showContextToolbar(toolbarX, toolbarY);
        setupContextToolbarEvents();
    } else {
        // 빈 공간 우클릭: 툴바 숨김
        hideContextToolbar();
        selectedNode = null;
        activeSubMenu = null;
    }
    
    // 이벤트 전파 완전히 차단
    return false;
}

function showContextToolbar(x, y) {
    const toolbar = document.getElementById("context-toolbar");
    if (!toolbar) return;
    
    // 하위 메뉴 모두 숨기기
    hideAllSubMenus();
    
    // 컨텍스트 툴바를 body에 직접 추가 (transform 영향 받지 않도록)
    if (toolbar.parentElement !== document.body) {
        document.body.appendChild(toolbar);
    }
    
    // transform 명시적으로 제거 (중요!)
    toolbar.style.transform = "none";
    toolbar.style.margin = "0";
    
    // 위치 계산 및 화면 경계 체크
    // clientX/clientY는 이미 화면 좌표이므로 추가 보정 없음
    const toolbarWidth = 250;
    const toolbarHeight = 50;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    let toolbarX = x;
    let toolbarY = y;
    
    // 오른쪽 경계 체크
    if (toolbarX + toolbarWidth > screenWidth) {
        toolbarX = screenWidth - toolbarWidth - 10;
    }
    
    // 아래쪽 경계 체크
    if (toolbarY + toolbarHeight > screenHeight) {
        toolbarY = screenHeight - toolbarHeight - 10;
    }
    
    // 왼쪽/위쪽 경계 체크
    if (toolbarX < 0) toolbarX = 10;
    if (toolbarY < 0) toolbarY = 10;
    
    // 직접 픽셀 값 설정 (추가 계산 없음)
    toolbar.style.left = toolbarX + "px";
    toolbar.style.top = toolbarY + "px";
    toolbar.classList.remove("hidden");
}

function hideContextToolbar() {
    const toolbar = document.getElementById("context-toolbar");
    if (toolbar) {
        toolbar.classList.add("hidden");
        hideAllSubMenus();
    }
    selectedNode = null;
    activeSubMenu = null;
}

function hideAllSubMenus() {
    const menus = ['context-color-menu', 'context-shape-menu', 'context-line-menu', 'context-border-menu'];
    menus.forEach(menuId => {
        const menu = document.getElementById(menuId);
        if (menu) menu.classList.add("hidden");
    });
    activeSubMenu = null;
}

function showSubMenu(menuId, buttonElement) {
    // 다른 메뉴 숨기기
    hideAllSubMenus();
    
    const menu = document.getElementById(menuId);
    if (!menu || !buttonElement) return;
    
    // 하위 메뉴를 body에 직접 추가 (transform 영향 받지 않도록)
    if (menu.parentElement !== document.body) {
        document.body.appendChild(menu);
    }
    
    // transform 명시적으로 제거 (중요!)
    menu.style.transform = "none";
    menu.style.margin = "0";
    
    // 현재 메뉴 표시
    menu.classList.remove("hidden");
    
    // 메인 툴바 위치를 기준으로 하위 메뉴 위치 계산
    const toolbar = document.getElementById("context-toolbar");
    if (!toolbar) return;
    
    const toolbarRect = toolbar.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const btnRect = buttonElement.getBoundingClientRect();
    
    // 메인 툴바 아래에 표시 (기본: 툴바 아래, 버튼과 같은 X 위치)
    let menuX = toolbarRect.left;
    let menuY = toolbarRect.bottom + 5;
    
    // 버튼이 툴바의 어느 위치에 있는지 확인하여 정렬
    const buttonIndex = Array.from(buttonElement.parentElement.children).indexOf(buttonElement);
    const buttonOffset = btnRect.left - toolbarRect.left;
    
    // 버튼 위치에 맞춰 하위 메뉴를 정렬 (선택적)
    // menuX = btnRect.left; // 버튼 바로 아래에 정렬하려면 이 줄 사용
    
    // 화면 경계 체크
    if (menuX + menuRect.width > window.innerWidth) {
        // 오른쪽에 공간이 없으면 왼쪽으로 이동
        menuX = window.innerWidth - menuRect.width - 10;
    }
    if (menuX < 0) {
        menuX = 10;
    }
    if (menuY + menuRect.height > window.innerHeight) {
        // 아래쪽에 공간이 없으면 툴바 위에 표시
        menuY = toolbarRect.top - menuRect.height - 5;
    }
    if (menuY < 0) {
        menuY = 10;
    }
    
    // 직접 픽셀 값 설정 (추가 계산 없음)
    menu.style.left = menuX + "px";
    menu.style.top = menuY + "px";
    
    // activeSubMenu 업데이트
    if (menuId === 'context-color-menu') {
        activeSubMenu = 'color';
    } else if (menuId === 'context-shape-menu') {
        activeSubMenu = 'shape';
    } else if (menuId === 'context-line-menu') {
        activeSubMenu = 'line';
    } else if (menuId === 'context-border-menu') {
        activeSubMenu = 'border';
    }
}

function onUpdateNode(nodeId, newProps) {
    // nodes 배열에서 노드 찾기
    const nodeIndex = nodes.findIndex(n => n.id === nodeId);
    if (nodeIndex === -1) {
        console.warn(`onUpdateNode: Node ${nodeId} not found`);
        return;
    }
    
    const node = nodes[nodeIndex];
    
    // 실제 노드 데이터 수정
    Object.keys(newProps).forEach(key => {
        node[key] = newProps[key];
    });
    
    // selectedNode도 업데이트 (같은 참조이므로 자동으로 반영됨)
    // 하지만 명시적으로 업데이트
    if (selectedNode && selectedNode.id === nodeId) {
        Object.keys(newProps).forEach(key => {
            selectedNode[key] = newProps[key];
        });
    }
    
    // selectedNodes 배열의 노드도 업데이트
    selectedNodes.forEach(selNode => {
        if (selNode.id === nodeId) {
            Object.keys(newProps).forEach(key => {
                selNode[key] = newProps[key];
            });
        }
    });
    
    // 상태 저장 및 화면 업데이트
    saveState();
    draw();
    
    console.log(`onUpdateNode: Updated node ${nodeId} with`, newProps);
}

function setupContextToolbarEvents() {
    const toolbar = document.getElementById("context-toolbar");
    if (!toolbar) return;
    
    // 메인 버튼 클릭 이벤트
    const mainButtons = toolbar.querySelectorAll('.context-btn');
    mainButtons.forEach(btn => {
        // 기존 리스너 제거 후 새로 추가
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            
            const action = newBtn.dataset.action;
            
            if (action === 'color') {
                if (activeSubMenu === 'color') {
                    hideAllSubMenus();
                } else {
                    showSubMenu('context-color-menu', newBtn);
                }
            } else if (action === 'shape') {
                if (activeSubMenu === 'shape') {
                    hideAllSubMenus();
                } else {
                    showSubMenu('context-shape-menu', newBtn);
                }
            } else if (action === 'line') {
                if (activeSubMenu === 'line') {
                    hideAllSubMenus();
                } else {
                    showSubMenu('context-line-menu', newBtn);
                }
            } else if (action === 'border') {
                if (activeSubMenu === 'border') {
                    hideAllSubMenus();
                } else {
                    showSubMenu('context-border-menu', newBtn);
                }
            } else if (action === 'connect') {
                // 선 연결 모드 시작 (우클릭 컨텍스트 메뉴에서 시작)
                if (selectedNode) {
                    connectFrom = selectedNode;
                    isConnecting = true;
                    isContextMenuConnectMode = true; // 우클릭 컨텍스트 메뉴에서 시작한 연결 모드 표시
                    const mainBtn = document.getElementById("btn-connect");
                    if (mainBtn) mainBtn.classList.add("active");
                    if (canvas) {
                        canvas.classList.add("connecting");
                        canvas.style.cursor = "crosshair";
                    }
                    hideContextToolbar();
                    draw();
                }
            }
        });
        
        newBtn.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });
        
        newBtn.addEventListener('mouseup', (e) => {
            e.stopPropagation();
        });
    });
    
    // 색상 버튼 클릭 이벤트
    const colorButtons = document.querySelectorAll('.context-color-btn');
    colorButtons.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            
            const color = newBtn.dataset.color;
            if (color && selectedNode) {
                onUpdateNode(selectedNode.id, { color: color });
                hideContextToolbar();
            }
        });
        
        newBtn.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });
        
        newBtn.addEventListener('mouseup', (e) => {
            e.stopPropagation();
        });
    });
    
    // 모양 버튼 클릭 이벤트
    const shapeButtons = document.querySelectorAll('.context-shape-btn');
    shapeButtons.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            
            const shape = newBtn.dataset.shape;
            if (shape && selectedNode) {
                onUpdateNode(selectedNode.id, { shape: shape });
                hideContextToolbar();
            }
        });
        
        newBtn.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });
        
        newBtn.addEventListener('mouseup', (e) => {
            e.stopPropagation();
        });
    });
    
    // 선 스타일 버튼 클릭 이벤트
    const lineButtons = document.querySelectorAll('.context-line-btn');
    lineButtons.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            
            const style = newBtn.dataset.style;
            if (style && selectedNode) {
                // 선택된 노드의 모든 연결선에 적용
                connections.forEach(conn => {
                    if (conn.from === selectedNode.id || conn.to === selectedNode.id) {
                        conn.style = style;
                    }
                });
                saveState();
                draw();
                hideContextToolbar();
            }
        });
        
        newBtn.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });
        
        newBtn.addEventListener('mouseup', (e) => {
            e.stopPropagation();
        });
    });
    
    // 테두리 버튼 클릭 이벤트
    const borderButtons = document.querySelectorAll('.context-border-btn');
    borderButtons.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            
            const borderWidth = newBtn.dataset.borderWidth;
            if (borderWidth !== undefined && selectedNode) {
                const width = parseInt(borderWidth);
                // 실제 노드 데이터 수정
                onUpdateNode(selectedNode.id, { borderWidth: width });
                hideContextToolbar();
            }
        });
        
        newBtn.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });
        
        newBtn.addEventListener('mouseup', (e) => {
            e.stopPropagation();
        });
    });
    
    // 툴바 외부 클릭 시 닫기 (연결 모드가 아닐 때만)
    document.addEventListener('click', (e) => {
        if (toolbar && !toolbar.classList.contains("hidden") && !isConnecting) {
            const isInToolbar = toolbar.contains(e.target);
            const isInSubMenu = e.target.closest('.context-submenu');
            if (!isInToolbar && !isInSubMenu) {
                hideContextToolbar();
            }
        }
    }, true);
    
    // ESC 키로 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape" && toolbar && !toolbar.classList.contains("hidden")) {
            hideContextToolbar();
        }
    });
}

function handleWheel(e) {
    if (!canvas) return;
    if (typeof zoom === 'undefined' || zoom === null) return;
    if (typeof setZoom !== 'function') return;
    
    e.preventDefault();
    try {
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const r = canvas.getBoundingClientRect();
        const center = {
            x: (e.clientX - r.left - panX) / zoom,
            y: (e.clientY - r.top - panY) / zoom
        };
        setZoom(zoom * delta, center);
        // 편집 중인 input 위치 업데이트
        updateEditingInputPosition();
    } catch (error) {
        console.error('Wheel zoom error:', error);
    }
}

// ==================== 키보드 이벤트 ====================
function handleKeyDown(e) {
    // 입력 필드나 편집 가능한 요소에 포커스가 있으면 무시
    const activeElement = document.activeElement;
    if (activeElement && (
        activeElement.tagName === "INPUT" || 
        activeElement.tagName === "TEXTAREA" ||
        activeElement.isContentEditable ||
        activeElement.contentEditable === "true" ||
        activeElement.closest('input, textarea, [contenteditable="true"]')
    )) {
        return;
    }

    // e.key와 e.code 모두 확인 (키보드 레이아웃에 관계없이 작동)
    // 먼저 e.code를 확인하고, 없으면 e.key를 사용
    const key = e.code || e.key;
    
    switch (key) {
        case "a":
        case "A":
            if (!e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                addNodeAtCenter();
            }
            break;
        case "c":
        case "C":
            if (!e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                toggleConnectMode();
            } else if (e.ctrlKey || e.metaKey) {
                copySelected();
            }
            break;
        case "v":
            if (e.ctrlKey || e.metaKey) {
                pasteNodes();
            }
            break;
        case "Delete":
        case "Backspace":
            deleteSelected();
            break;
        case "f":
        case "F":
            zoomToFit();
            break;
        case "Escape":
            // 편집 중이면 편집 취소
            if (editingNode) {
                e.preventDefault();
                finishNodeTextEdit(false);
                return;
            }
            if (isConnecting) {
                isConnecting = false;
                isContextMenuConnectMode = false;
                connectFrom = null;
                const btn = document.getElementById("btn-connect");
                if (btn) btn.classList.remove("active");
                if (canvas) {
                    canvas.classList.remove("connecting");
                    canvas.style.cursor = "default";
                }
                draw();
            } else {
                closeApp();
            }
            break;
        case "z":
        case "Z":
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                if (e.shiftKey) {
                    redo();
                } else {
                    undo();
                }
            }
            break;
        case "y":
        case "Y":
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                redo();
            }
            break;
        case "s":
        case "S":
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                saveToFile();
            } else {
                // S 키만 누르면 크기 조절 모드 활성화
                isScaling = true;
                if (canvas) canvas.style.cursor = "ns-resize";
            }
            break;
        case "o":
        case "O":
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                openFile();
            }
            break;
        case "+":
        case "=":
        case "Equal": // 물리적 키 코드 (e.code)
            e.preventDefault();
            e.stopPropagation();
            try {
                if (typeof zoom !== 'undefined' && zoom !== null && typeof setZoom === 'function') {
                    setZoom(zoom * 1.1);
                }
            } catch (error) {
                console.error('Zoom in error:', error);
            }
            return false;
        case "-":
        case "−": // 마이너스 기호 (유니코드)
        case "Minus": // 물리적 키 코드 (e.code)
            e.preventDefault();
            e.stopPropagation();
            try {
                if (typeof zoom !== 'undefined' && zoom !== null && typeof setZoom === 'function') {
                    setZoom(zoom * 0.9);
                }
            } catch (error) {
                console.error('Zoom out error:', error);
            }
            return false;
        case "0":
        case "Digit0": // 물리적 키 코드 (e.code)
            e.preventDefault();
            e.stopPropagation();
            try {
                if (typeof setZoom === 'function') {
                    setZoom(1);
                }
            } catch (error) {
                console.error('Zoom reset error:', error);
            }
            return false;
        case "?":
            if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                e.preventDefault();
                toggleHelpPanel();
            }
            break;
        case "p":
        case "P":
            if (!e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                toggleMouseEvents();
            }
            break;
        case "m":
        case "M":
            if (!e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                toggleMemorizationMode();
            }
            break;
        case "ArrowUp":
            if (e.shiftKey) {
                moveSelected(0, -10);
            }
            break;
        case "ArrowDown":
            if (e.shiftKey) {
                moveSelected(0, 10);
            }
            break;
        case "ArrowLeft":
            if (e.shiftKey) {
                moveSelected(-10, 0);
            }
            break;
        case "ArrowRight":
            if (e.shiftKey) {
                moveSelected(10, 0);
            }
            break;
        case "g":
        case "G":
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                if (e.shiftKey) {
                    ungroupSelectedNodes();
                } else {
                    groupSelectedNodes();
                }
            }
            break;
    }
    
    // Ctrl+A: 전체 선택
    if ((e.ctrlKey || e.metaKey) && (e.key === "a" || e.key === "A")) {
        if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
            e.preventDefault();
            selectAllNodes();
        }
    }
}

function handleKeyUp(e) {
    // S 키 떼기 처리
    const key = e.code || e.key;
    if (key === "s" || key === "S") {
        if (!e.ctrlKey && !e.metaKey) {
            isScaling = false;
            if (!scalingNode && canvas) {
                // 크기 조절 중이 아니면 커서 복원
                const pos = getCanvasPos(e);
                const node = hitTest(pos.x, pos.y);
                if (canvas) canvas.style.cursor = node ? "move" : (isConnecting ? "crosshair" : "default");
            }
        }
    }
}

// ==================== 그리기 ====================
function draw() {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:816',message:'draw called',data:{canvasExists:!!canvas,ctxExists:!!ctx,nodesCount:nodes.length,memorizationModeExists:typeof memorizationMode!=='undefined',revealedNodesExists:typeof revealedNodes!=='undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    if (!canvas || !ctx) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:820',message:'draw: canvas or ctx is null',data:{canvasExists:!!canvas,ctxExists:!!ctx},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        return;
    }
    
    try {
    // 투명도 초기화 (잔상 버그 수정)
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 보드 배경 그리기
    if (boardColorMode === "transparent") {
        // 투명 모드: 배경을 그리지 않음
    } else {
        const currentBoardColor = boardColorMode === "white" ? "#ffffff" : "#000000";
        
        if (boardImage) {
            if (boardImageObj && boardImageObj.complete) {
                // 이미지가 이미 로드되어 있으면 바로 그리기
                ctx.save();
                ctx.globalAlpha = boardOpacity;
                ctx.drawImage(boardImageObj, 0, 0, canvas.width, canvas.height);
                ctx.restore();
            } else {
                // 이미지가 없으면 로드
                boardImageObj = new Image();
                boardImageObj.onload = () => {
                    draw(); // 이미지 로드 후 다시 그리기
                };
                boardImageObj.src = boardImage;
                // 로드 중일 때는 배경색으로 대체
                ctx.save();
                ctx.fillStyle = currentBoardColor;
                ctx.globalAlpha = boardOpacity;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.restore();
            }
        } else {
            ctx.save();
            ctx.fillStyle = currentBoardColor;
            ctx.globalAlpha = boardOpacity;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        }
    }
        
        ctx.save();
        ctx.translate(panX, panY);
        ctx.scale(zoom, zoom);
        ctx.globalAlpha = 1; // 투명도 초기화

        // 그리드 (옵션)
        drawGrid();

    // 연결선
        drawConnections();

        // 노드
        drawNodes();

        // 연결 모드 프리뷰
        if (isConnecting && connectFrom) {
            drawConnectionPreview(connectFrom, mousePos);
        }

        ctx.restore();
        ctx.globalAlpha = 1; // 투명도 초기화
        
        
        // 암기 모드일 때 테두리 강조
        if (memorizationMode) {
            ctx.strokeStyle = '#ff4444';
            ctx.lineWidth = 3;
            ctx.strokeRect(0, 0, canvas.width, canvas.height);
        }
        
        // 편집 중인 input 위치 업데이트
        updateEditingInputPosition();
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:845',message:'draw completed',data:{nodesDrawn:nodes.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
    } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:850',message:'draw: error caught',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        console.error('draw error:', error);
        throw error; // 에러를 다시 throw하여 호출자에게 전달
    }
}

function drawGrid() {
    if (!canvas || !ctx || zoom < 0.3 || !showGrid) return;
    
    const gridSize = 50;
    // 월드 좌표계에서 그리드 범위 계산
    const worldLeft = -panX / zoom;
    const worldTop = -panY / zoom;
    const worldRight = worldLeft + canvas.width / zoom;
    const worldBottom = worldTop + canvas.height / zoom;
    
    const startX = Math.floor(worldLeft / gridSize) * gridSize;
    const startY = Math.floor(worldTop / gridSize) * gridSize;
    const endX = Math.ceil(worldRight / gridSize) * gridSize;
    const endY = Math.ceil(worldBottom / gridSize) * gridSize;

    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;

    for (let x = startX; x <= endX; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
    }

    for (let y = startY; y <= endY; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
    }
}

function drawConnections() {
    ctx.save();
    ctx.globalAlpha = 1; // 투명도 초기화
    connections.forEach(conn => {
        const from = nodes.find(n => n.id === conn.from);
        const to = nodes.find(n => n.id === conn.to);
        if (!from || !to) return;

        const isSelected = selectedNodes.includes(from) || selectedNodes.includes(to) || selectedConnection === conn;
        const style = conn.style || connectionLineStyle; // 연결별 스타일 또는 전역 스타일
        
        ctx.strokeStyle = isSelected ? "rgba(45, 137, 239, 0.8)" : "rgba(255, 255, 255, 0.4)";
        
        // 곡선 연결 제어점 계산
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const cp1x = from.x + dx * 0.5;
        const cp1y = from.y;
        const cp2x = to.x - dx * 0.5;
        const cp2y = to.y;

        // 일반 선 스타일
        // 스타일에 따른 선 설정
        switch(style) {
            case 'solid':
                ctx.lineWidth = isSelected ? 3 : 2;
                ctx.setLineDash([]);
                break;
            case 'dashed':
                ctx.lineWidth = isSelected ? 3 : 2;
                ctx.setLineDash([10, 5]);
                break;
            case 'thick':
                ctx.lineWidth = isSelected ? 10 : 8;
                ctx.setLineDash([]);
                break;
            default:
                ctx.lineWidth = isSelected ? 3 : 2;
                ctx.setLineDash([]);
        }

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, to.x, to.y);
        ctx.stroke();
        
        // 선 스타일 초기화
        ctx.setLineDash([]);
    });
    ctx.restore();
}

function drawNodes() {
    nodes.forEach(node => {
        const isSelected = selectedNodes.includes(node);
        const isHovered = node === hoveredNode;
        const isRevealed = !memorizationMode || revealedNodes.has(node.id) || isHovered || isSelected;

        ctx.save();

        // 이미지가 있으면 노드 형태를 그리지 않고 이미지만 그리기
        if (node.image) {
            // 이미지 객체 캐싱
            if (!node._imageObj) {
                node._imageObj = new Image();
                node._imageObj.onload = () => {
                    draw(); // 이미지 로드 후 다시 그리기
                };
                node._imageObj.src = node.image;
            }
            
            // 이미지가 로드되어 있으면 그리기
            if (node._imageObj.complete && node._imageObj.naturalWidth > 0) {
                const size = node.size || 30;
                const aspectRatio = node.imageAspectRatio || 1.0; // 기본값 1.0 (정사각형)
                const imgWidth = size * 2 * aspectRatio;
                const imgHeight = size * 2;
                
                ctx.save();
                ctx.globalAlpha = node.opacity || 0.9;
                
                // 그림자 (선택/호버 시)
                if (isSelected || isHovered) {
                    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
                    ctx.shadowBlur = 15;
                    ctx.shadowOffsetX = 3;
                    ctx.shadowOffsetY = 3;
                }
                
                // 이미지를 노드 중앙에 그리기
                ctx.drawImage(node._imageObj, node.x - imgWidth / 2, node.y - imgHeight / 2, imgWidth, imgHeight);
                
                // 선택 표시 (이미지 주변에 테두리)
                if (isSelected) {
                    ctx.shadowColor = "transparent";
                    ctx.shadowBlur = 0;
                    ctx.strokeStyle = "#2d89ef";
                    ctx.lineWidth = 3;
                    ctx.setLineDash([5, 5]);
                    ctx.strokeRect(node.x - imgWidth / 2, node.y - imgHeight / 2, imgWidth, imgHeight);
                    ctx.setLineDash([]);
                }
                
                ctx.globalAlpha = 1;
                ctx.restore();
            }
        } else {
            // 이미지가 없을 때만 노드 형태 그리기
            // 그림자
            if (isSelected || isHovered) {
                ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
                ctx.shadowBlur = 15;
                ctx.shadowOffsetX = 3;
                ctx.shadowOffsetY = 3;
            }

            // 노드 배경
            const alpha = node.opacity || 0.9;
            ctx.fillStyle = hexToRgba(node.color || "#2d89ef", alpha);
            ctx.strokeStyle = isSelected ? "#ffffff" : "rgba(255, 255, 255, 0.8)";
            ctx.lineWidth = node.borderWidth || 2;

            // 모양별 그리기
            drawNodeShape(node, node.shape || "circle");
        }

        // 우선순위 표시
        if (node.priority && node.priority > 3) {
            ctx.fillStyle = "#ff6b6b";
            ctx.beginPath();
            ctx.arc(node.x + node.size * 0.7, node.y - node.size * 0.7, 6, 0, Math.PI * 2);
        ctx.fill();
        }

        // 진행률 표시
        if (node.progress > 0) {
            ctx.strokeStyle = "#4ecdc4";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.size + 5, -Math.PI / 2, -Math.PI / 2 + (node.progress / 100) * Math.PI * 2);
            ctx.stroke();
        }

        // 텍스트 (이미지가 없을 때만 표시)
        if (!node.image) {
            // 노드 배경색에 따라 텍스트 색상 결정
            const nodeColor = node.color || "#ffffff";
            const isLightColor = nodeColor === "#ffffff" || nodeColor.toLowerCase() === "#ffffff";
            ctx.fillStyle = isLightColor ? "#000000" : "#ffffff";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = `bold ${node.fontSize || 14}px sans-serif`;
            
            let text = node.text;
            if (node.icon) {
                text = node.icon + " " + text;
            }
            
            // 암기 모드에서 숨김 처리
            if (memorizationMode && !isRevealed) {
                text = "?".repeat(Math.max(3, Math.min(text.length, 10)));
                ctx.fillStyle = isLightColor ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.5)";
            }
            
            ctx.fillText(text, node.x, node.y);
        }

        // 선택 표시 (이미지가 없을 때만 노드 모양에 맞게)
        if (isSelected && !node.image) {
            ctx.strokeStyle = "#2d89ef";
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            drawNodeSelectionBorder(node, node.shape || "circle");
            ctx.setLineDash([]);
        }

        ctx.restore();
    });
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:1076',message:'drawNodes completed',data:{nodesDrawn:nodes.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run7',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
}

function drawNodeShape(node, shape) {
    const size = node.size || 30;
    
    switch (shape) {
        case "circle":
            ctx.beginPath();
            ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            break;
        case "square":
            ctx.fillRect(node.x - size, node.y - size, size * 2, size * 2);
            ctx.strokeRect(node.x - size, node.y - size, size * 2, size * 2);
            break;
        case "diamond":
            ctx.beginPath();
            ctx.moveTo(node.x, node.y - size);
            ctx.lineTo(node.x + size, node.y);
            ctx.lineTo(node.x, node.y + size);
            ctx.lineTo(node.x - size, node.y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
        case "hexagon":
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i;
                const x = node.x + size * Math.cos(angle);
                const y = node.y + size * Math.sin(angle);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
    }
}

// 노드 선택 테두리 그리기 (노드 모양에 맞게)
// ==================== 노드 텍스트 인라인 편집 ====================
function startNodeTextEdit(node) {
    if (!node || !canvas) return;
    
    // 이미 편집 중이면 무시
    if (editingNode && editingNode.id === node.id) return;
    
    // 기존 편집 종료
    if (editingNode) {
        finishNodeTextEdit(true);
    }
    
    editingNode = node;
    
    // 노드 위치를 화면 좌표로 변환
    const screenPos = worldToScreen(node.x, node.y);
    
    // input 요소 생성
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'node-text-edit';
    input.value = node.text || '';
    input.style.cssText = `
        position: fixed;
        left: ${screenPos.x}px;
        top: ${screenPos.y}px;
        transform: translate(-50%, -50%);
        z-index: 2147483647;
        background: rgba(255, 255, 255, 0.95);
        border: 2px solid #2d89ef;
        border-radius: 4px;
        padding: 4px 8px;
        font-size: ${node.fontSize || 14}px;
        font-weight: bold;
        font-family: sans-serif;
        color: #000;
        min-width: 100px;
        max-width: 300px;
        text-align: center;
        outline: none;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;
    
    // 편집 완료 핸들러
    const finishEdit = (save) => {
        if (save && input.value.trim() !== '') {
            node.text = input.value.trim();
            // nodes 배열에서도 업데이트
            const nodeIndex = nodes.findIndex(n => n.id === node.id);
            if (nodeIndex !== -1) {
                nodes[nodeIndex].text = node.text;
            }
            // selectedNodes도 업데이트
            const selectedIndex = selectedNodes.findIndex(n => n.id === node.id);
            if (selectedIndex !== -1) {
                selectedNodes[selectedIndex].text = node.text;
            }
            saveState();
            draw();
        }
        
        // input 제거
        if (input.parentNode) {
            input.parentNode.removeChild(input);
        }
        editingNode = null;
    };
    
    // Enter 키: 저장
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            finishEdit(true);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            finishEdit(false);
        }
    });
    
    // blur: 저장
    input.addEventListener('blur', () => {
        finishEdit(true);
    });
    
    // overlay-root에 추가
    const overlayRoot = document.getElementById('overlay-root');
    if (overlayRoot) {
        overlayRoot.appendChild(input);
        // 포커스 및 텍스트 선택
        setTimeout(() => {
            input.focus();
            input.select();
        }, 10);
    }
}

function finishNodeTextEdit(save) {
    if (!editingNode) return;
    
    const input = document.querySelector('.node-text-edit');
    if (input) {
        if (save && input.value.trim() !== '') {
            editingNode.text = input.value.trim();
            // nodes 배열에서도 업데이트
            const nodeIndex = nodes.findIndex(n => n.id === editingNode.id);
            if (nodeIndex !== -1) {
                nodes[nodeIndex].text = editingNode.text;
            }
            // selectedNodes도 업데이트
            const selectedIndex = selectedNodes.findIndex(n => n.id === editingNode.id);
            if (selectedIndex !== -1) {
                selectedNodes[selectedIndex].text = editingNode.text;
            }
            saveState();
            draw();
        }
        
        if (input.parentNode) {
            input.parentNode.removeChild(input);
        }
    }
    
    editingNode = null;
}

// 편집 중인 input 위치 업데이트 (줌/팬 변경 시)
function updateEditingInputPosition() {
    if (!editingNode) return;
    
    const input = document.querySelector('.node-text-edit');
    if (input && editingNode) {
        const screenPos = worldToScreen(editingNode.x, editingNode.y);
        input.style.left = `${screenPos.x}px`;
        input.style.top = `${screenPos.y}px`;
    }
}

function drawNodeSelectionBorder(node, shape) {
    const size = (node.size || 30) + 5;
    ctx.beginPath();
    
    switch (shape) {
        case "circle":
            ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
            break;
        case "square":
            ctx.rect(node.x - size, node.y - size, size * 2, size * 2);
            break;
        case "diamond":
            ctx.moveTo(node.x, node.y - size);
            ctx.lineTo(node.x + size, node.y);
            ctx.lineTo(node.x, node.y + size);
            ctx.lineTo(node.x - size, node.y);
            ctx.closePath();
            break;
        case "hexagon":
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i;
                const x = node.x + size * Math.cos(angle);
                const y = node.y + size * Math.sin(angle);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            break;
    }
    ctx.stroke();
}

function drawConnectionPreview(from, to) {
    if (!from || !to) return;
    
    ctx.save();
    ctx.globalAlpha = 1; // 투명도 초기화
    ctx.strokeStyle = "rgba(45, 137, 239, 0.6)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    // to가 좌표 객체인지 노드인지 확인
    const toX = to.x !== undefined ? to.x : (to.node ? to.node.x : 0);
    const toY = to.y !== undefined ? to.y : (to.node ? to.node.y : 0);
    
    const dx = toX - from.x;
    const dy = toY - from.y;
    const cp1x = from.x + dx * 0.5;
    const cp1y = from.y;
    const cp2x = toX - dx * 0.5;
    const cp2y = toY;

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, toX, toY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
}

// ==================== 유틸리티 ====================
function hitTest(x, y) {
    const result = nodes.find(n => {
        const size = n.size || 30;
        const dist = Math.hypot(n.x - x, n.y - y);
        return dist < size;
    });
    
    // #region agent log
    if (!result) {
        fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:879',message:'hitTest: no node found',data:{x,y,nodeCount:nodes.length,nodePositions:nodes.map(n=>({id:n.id,x:n.x,y:n.y,size:n.size||30}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    }
    // #endregion
    
    return result;
}

// 연결선 클릭 감지 함수
function hitTestConnection(x, y) {
    // 확대/축소 비율에 맞게 클릭 감지 반경 조정 (월드 좌표 기준)
    // 확대되면 시각적으로 선이 두꺼워지므로 감지 반경도 조정
    const baseThreshold = 8; // 기본 클릭 감지 반경
    const hitThreshold = baseThreshold / (zoom || 1); // 확대 시 감지 반경 축소 (월드 좌표 기준)
    
    for (const conn of connections) {
        const from = nodes.find(n => n.id === conn.from);
        const to = nodes.find(n => n.id === conn.to);
        if (!from || !to) continue;
        
        // Bezier 곡선의 제어점 계산
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const cp1x = from.x + dx * 0.5;
        const cp1y = from.y;
        const cp2x = to.x - dx * 0.5;
        const cp2y = to.y;
        
        // Bezier 곡선 위의 여러 점을 샘플링하여 거리 계산
        // 확대 시 더 많은 샘플링으로 정확도 향상
        const sampleStep = zoom > 1 ? 0.03 : 0.05; // 확대 시 더 촘촘하게 샘플링
        for (let t = 0; t <= 1; t += sampleStep) {
            const bx = Math.pow(1 - t, 3) * from.x + 
                       3 * Math.pow(1 - t, 2) * t * cp1x + 
                       3 * (1 - t) * Math.pow(t, 2) * cp2x + 
                       Math.pow(t, 3) * to.x;
            const by = Math.pow(1 - t, 3) * from.y + 
                       3 * Math.pow(1 - t, 2) * t * cp1y + 
                       3 * (1 - t) * Math.pow(t, 2) * cp2y + 
                       Math.pow(t, 3) * to.y;
            
            const dist = Math.hypot(bx - x, by - y);
            if (dist < hitThreshold) {
                return conn;
            }
        }
    }
    
    return null;
}

function hexToRgba(hex, alpha) {
    if (!hex || typeof hex !== 'string' || hex.length < 7) {
        return `rgba(45, 137, 239, ${alpha || 0.9})`; // 기본 색상
    }
    const r = parseInt(hex.slice(1, 3), 16) || 45;
    const g = parseInt(hex.slice(3, 5), 16) || 137;
    const b = parseInt(hex.slice(5, 7), 16) || 239;
    return `rgba(${r}, ${g}, ${b}, ${alpha || 0.9})`;
}

// ==================== 노드 관리 ====================
function addNode(x, y, text = "새 노드") {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:897',message:'addNode called',data:{x,y,text,canvasExists:!!canvas,zoom,panX,panY},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    if (!canvas) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:899',message:'addNode: canvas is null',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        return null;
    }
    // 좌표가 제공되지 않으면 화면 중앙에 생성
    const centerX = x !== undefined ? x : (canvas.width / 2 - panX) / zoom;
    const centerY = y !== undefined ? y : (canvas.height / 2 - panY) / zoom;
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:901',message:'addNode: calculated coords',data:{centerX,centerY,canvasWidth:canvas.width,canvasHeight:canvas.height},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    const node = {
        id: nextNodeId++,
        x: centerX,
        y: centerY,
        text: text,
        color: "#ffffff",
        size: 35,
        fontSize: 14,
        shape: "circle",
        borderWidth: 2,
        opacity: 0.9,
        icon: "",
        note: "",
        tags: [],
        priority: 3,
        progress: 0,
        link: "",
        parent: null,
        image: null // 노드 이미지
    };
    nodes.push(node);
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:923',message:'addNode: node pushed',data:{nodeId:node.id,nodeCount:nodes.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    selectNode(node);
    updateNodeCount();
    saveState();
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:1097',message:'addNode: before draw',data:{nodeId:node.id,ctxExists:!!ctx},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
draw();

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:1103',message:'addNode: after draw',data:{nodeId:node.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:1107',message:'addNode: returning node',data:{nodeId:node.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    return node;
}

// ==================== 툴바 버튼 핸들러 함수들 (HTML 순서에 따라 정렬) ====================
// HTML 순서: 1. btn-add
function addNodeAtCenter() {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:1241',message:'addNodeAtCenter called',data:{canvasExists:!!canvas,canvasWidth:canvas?.width,canvasHeight:canvas?.height,zoom,panX,panY},timestamp:Date.now(),sessionId:'debug-session',runId:'run7',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    if (!canvas) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:1246',message:'addNodeAtCenter: canvas is null',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run7',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        return;
    }
    // Electron 환경에서는 prompt가 작동하지 않을 수 있으므로 직접 추가
    // canvas.width가 0일 경우 window.innerWidth 사용
    const canvasWidth = canvas.width || window.innerWidth || 800;
    const canvasHeight = canvas.height || window.innerHeight || 600;
    const centerX = (canvasWidth / 2 - panX) / zoom;
    const centerY = (canvasHeight / 2 - panY) / zoom;
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:936',message:'addNodeAtCenter: calling addNode',data:{centerX,centerY},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    const node = addNode(centerX, centerY, "새 노드");
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:938',message:'addNodeAtCenter: addNode result',data:{nodeReturned:!!node,nodeId:node?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    if (node) {
        // 노드 패널을 열어서 이름을 편집할 수 있게 함
        setTimeout(() => {
            openNodePanel(node);
            const textInput = document.getElementById("node-text");
            if (textInput) {
                textInput.focus();
                textInput.select();
            }
        }, 100);
    }
}

// HTML 순서: 2. btn-connect
function toggleConnectMode() {
    isConnecting = !isConnecting;
    const btn = document.getElementById("btn-connect");
    
    if (isConnecting) {
        // 툴바에서 시작한 연결 모드 (계속 연결 가능)
        isContextMenuConnectMode = false;
        if (btn) btn.classList.add("active");
        if (canvas) {
            canvas.classList.add("connecting");
            canvas.style.cursor = "crosshair";
        }
        if (selectedNodes.length === 1) {
            connectFrom = selectedNodes[0];
        } else {
            connectFrom = null;
        }
        // 즉시 UI 업데이트
        if (canvas && ctx) {
            draw();
        }
    } else {
        if (btn) btn.classList.remove("active");
        if (canvas) {
            canvas.classList.remove("connecting");
            canvas.style.cursor = "default";
        }
        connectFrom = null;
        isContextMenuConnectMode = false;
        // 즉시 UI 업데이트
        if (canvas && ctx) {
            draw();
        }
    }
}

function createConnection(fromId, toId) {
    // 유효성 검사
    if (fromId === undefined || fromId === null || toId === undefined || toId === null) {
        console.warn("createConnection: Invalid node IDs", { fromId, toId });
        return;
    }
    
    // 자기 자신과의 연결 방지
    if (fromId === toId) {
        return;
    }
    
    // 중복 체크
    if (connections.some(c => c.from === fromId && c.to === toId)) {
        return;
    }
    
    connections.push({ from: fromId, to: toId, style: connectionLineStyle });
    updateConnectionCount();
    saveState();
    draw();
}

function deleteConnection(fromId, toId) {
    connections = connections.filter(c => !(c.from === fromId && c.to === toId));
    updateConnectionCount();
    saveState();
    draw();
}

// HTML 순서: 3. btn-delete
function deleteSelected() {
    if (selectedNodes.length === 0) return;
    selectedNodes.forEach(node => deleteNode(node));
    selectedNodes = [];
}

function deleteNode(node) {
    const index = nodes.indexOf(node);
    if (index > -1) {
        nodes.splice(index, 1);
        connections = connections.filter(c => c.from !== node.id && c.to !== node.id);
        selectedNodes = selectedNodes.filter(n => n !== node);
        updateNodeCount();
        updateConnectionCount();
        saveState();
        draw();
    }
}

function duplicateNode(node) {
    const newNode = {
        ...node,
        id: nextNodeId++,
        x: node.x + 50,
        y: node.y + 50,
        text: node.text + " 복사"
    };
    nodes.push(newNode);
    selectNode(newNode);
    updateNodeCount();
    saveState();
    draw();
    return newNode;
}

// ==================== 선택 관리 ====================
function selectNode(node) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:985',message:'selectNode called',data:{nodeId:node?.id,alreadySelected:selectedNodes.includes(node),currentSelectedCount:selectedNodes.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    // 기존 선택 해제 후 새 노드만 선택
    selectedNodes = [node];
    selectedConnection = null; // 연결선 선택 해제
    closeConnectionPanel(); // 연결선 패널 닫기
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:990',message:'selectNode: calling updateNodePanel',data:{selectedCount:selectedNodes.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    updateNodePanel();
    draw();
}

function toggleSelection(node) {
    const index = selectedNodes.indexOf(node);
    if (index > -1) {
        selectedNodes.splice(index, 1);
    } else {
        selectedNodes.push(node);
    }
    updateNodePanel();
    draw();
}

function clearSelection() {
    selectedNodes = [];
    selectedConnection = null;
    closeNodePanel();
    closeConnectionPanel();
    draw();
}

function restoreState(state) {
    if (!state || !state.nodes) return;
    nodes = JSON.parse(JSON.stringify(state.nodes));
    connections = JSON.parse(JSON.stringify(state.connections || []));
    // nextNodeId 업데이트
    if (nodes.length > 0) {
        nextNodeId = Math.max(...nodes.map(n => n.id || 0), 0) + 1;
    }
    selectedNodes = [];
    updateNodeCount();
    updateConnectionCount();
    closeNodePanel();
    draw();
}

// HTML 순서: 4. btn-undo
function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        restoreState(history[historyIndex]);
    }
}

// HTML 순서: 5. btn-redo
function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        restoreState(history[historyIndex]);
    }
}

// HTML 순서: 6. btn-save
async function saveToFile() {
    if (!window.api) {
        // Electron이 아닌 환경에서는 기존 방식 사용
        exportData();
        return;
    }
    
    const data = {
        nodes: nodes,
        connections: connections,
        nodeGroups: nodeGroups || [],
        version: "2.0",
        timestamp: Date.now(),
        zoom: zoom,
        panX: panX,
        panY: panY,
        boardColorMode: boardColorMode,
        boardOpacity: boardOpacity
    };
    
    try {
        const result = await window.api.saveFile(JSON.stringify(data));
        if (result.success) {
            currentFilePath = result.filePath;
            isModified = false;
            const fileName = result.filePath.split(/[/\\]/).pop();
            updateStatusText(`저장 완료: ${fileName}`);
        } else if (!result.cancelled) {
            alert('파일 저장 실패: ' + (result.error || '알 수 없는 오류'));
        }
    } catch (error) {
        console.error('저장 오류:', error);
        alert('파일 저장 중 오류가 발생했습니다.');
    }
}

// HTML 순서: 7. btn-open
async function openFile() {
    if (!window.api) {
        // Electron이 아닌 환경에서는 기존 방식 사용
        importData();
        return;
    }
    
    try {
        const result = await window.api.openFile();
        if (result.success) {
            await loadData(JSON.parse(result.data), result.filePath);
        } else if (!result.cancelled) {
            alert('파일 열기 실패: ' + (result.error || '알 수 없는 오류'));
        }
    } catch (error) {
        console.error('파일 열기 오류:', error);
        alert('파일을 열 수 없습니다.');
    }
}

// HTML 순서: 8-9. btn-zoom-in, btn-zoom-out
function setZoom(newZoom, center = null) {
    if (!canvas) return;
    if (typeof newZoom !== 'number' || isNaN(newZoom)) return;
    
    const oldZoom = typeof zoom !== 'undefined' ? zoom : 1;
    zoom = Math.max(0.25, Math.min(4, newZoom));
    
    if (center) {
        // 줌 중심점 유지
        const zoomFactor = zoom / oldZoom;
    const r = canvas.getBoundingClientRect();
        const screenX = center.x * oldZoom + panX;
        const screenY = center.y * oldZoom + panY;
        panX = screenX - center.x * zoom;
        panY = screenY - center.y * zoom;
    }
    
    const zoomSlider = document.getElementById("zoom-slider");
    const zoomValue = document.getElementById("zoom-value");
    if (zoomSlider) zoomSlider.value = zoom * 100;
    if (zoomValue) zoomValue.textContent = Math.round(zoom * 100) + "%";
    draw();
}

// HTML 순서: 10. btn-zoom-fit
function zoomToFit() {
    if (!canvas || nodes.length === 0) return;
    
    const bounds = getNodesBounds();
    const padding = 100;
    const scaleX = bounds.width > 0 ? (canvas.width - padding * 2) / bounds.width : 1;
    const scaleY = bounds.height > 0 ? (canvas.height - padding * 2) / bounds.height : 1;
    const newZoom = Math.min(scaleX, scaleY, 2);
    
    setZoom(newZoom);
    // 중앙 정렬
    panX = canvas.width / 2 - bounds.centerX * zoom;
    panY = canvas.height / 2 - bounds.centerY * zoom;
    draw();
}

function getNodesBounds() {
    if (nodes.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0, centerX: 0, centerY: 0 };
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(node => {
        const size = node.size || 30;
        minX = Math.min(minX, node.x - size);
        minY = Math.min(minY, node.y - size);
        maxX = Math.max(maxX, node.x + size);
        maxY = Math.max(maxY, node.y + size);
    });
    
    return {
        minX, minY, maxX, maxY,
        width: maxX - minX,
        height: maxY - minY,
        centerX: (minX + maxX) / 2,
        centerY: (minY + maxY) / 2
    };
}

// 전역 mousemove 핸들러 참조
let globalMouseMoveHandler = null;

// 전역 mousemove 핸들러 설정 (마우스 통과 모드 활성화 시)
function setupGlobalMouseMoveHandler() {
    if (globalMouseMoveHandler) {
        return; // 이미 설정됨
    }
    
    globalMouseMoveHandler = (e) => {
        if (!mouseEventsIgnored) {
            return; // 마우스 통과 모드가 비활성화되면 무시
        }
        
        // 마우스 위치에서 요소 확인
        const target = document.elementFromPoint(e.clientX, e.clientY);
        
        // toolbar, node-panel, help-panel 위에 있는지 확인
        const isOverToolbar = target && target.closest('.toolbar');
        const isOverPanel = target && target.closest('.node-panel, .help-panel');
        
        // 캔버스 위에 노드가 있는지 확인
        let isOverNode = false;
        if (canvas && target === canvas) {
            const rect = canvas.getBoundingClientRect();
            const canvasX = e.clientX - rect.left;
            const canvasY = e.clientY - rect.top;
            const pos = {
                x: (canvasX - panX) / zoom,
                y: (canvasY - panY) / zoom
            };
            const node = hitTest(pos.x, pos.y);
            isOverNode = !!node;
        }
        
        // toolbar, panel, 또는 노드 위에 있으면 마우스 이벤트 활성화
        if (isOverToolbar || isOverPanel || isOverNode) {
            if (window.api) window.api.setIgnoreMouseEvents(false);
        } else {
            // 빈 공간에서는 마우스 이벤트 통과 (forward 옵션으로 위치 정보는 계속 받음)
            if (window.api) window.api.setIgnoreMouseEvents(true, { forward: true });
        }
    };
    
    document.addEventListener('mousemove', globalMouseMoveHandler, true); // capture phase
}

// 전역 mousemove 핸들러 제거
function removeGlobalMouseMoveHandler() {
    if (globalMouseMoveHandler) {
        document.removeEventListener('mousemove', globalMouseMoveHandler, true);
        globalMouseMoveHandler = null;
    }
}

// HTML 순서: 11. btn-mouse-toggle
function toggleMouseEvents() {
    if (!window.api) {
        console.error('window.api is not available');
        return;
    }
    
    // 상태 토글
    mouseEventsIgnored = !mouseEventsIgnored;
    
    // Main 프로세스에 상태 전달
    window.api.toggleMouseEvents(mouseEventsIgnored);
    
    // UI 업데이트
    const btn = document.getElementById("btn-mouse-toggle");
    if (btn) {
        if (mouseEventsIgnored) {
            btn.classList.add("active");
            btn.title = "마우스 통과 해제 (P) - 마인드맵 조작 가능";
            updateStatusText("마우스 통과 모드 활성화 - 다른 앱 사용 가능");
            // Visual feedback: 점선 보더 추가
            document.body.classList.add("mouse-passthrough-active");
            // 전역 mousemove 핸들러 활성화
            setupGlobalMouseMoveHandler();
        } else {
            btn.classList.remove("active");
            btn.title = "마우스 통과 (P) - 다른 앱 사용 가능";
            updateStatusText("마우스 통과 모드 해제 - 마인드맵 조작 가능");
            // Visual feedback: 점선 보더 제거
            document.body.classList.remove("mouse-passthrough-active");
            // 전역 mousemove 핸들러 비활성화
            removeGlobalMouseMoveHandler();
            // 마우스 이벤트 정상 처리로 복원
            if (window.api) window.api.setIgnoreMouseEvents(false);
        }
    }
    
    console.log('toggleMouseEvents:', mouseEventsIgnored ? 'enabled' : 'disabled');
}

// HTML 순서: 12. btn-memorization
function toggleMemorizationMode() {
    memorizationMode = !memorizationMode;
    
    const btn = document.getElementById("btn-memorization");
    if (btn) {
        if (memorizationMode) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    }
    
    if (memorizationMode) {
        // 암기 모드 활성화: 모든 노드 숨김
        revealedNodes.clear();
        updateStatusText("🧠 암기 모드 활성화 - 노드를 클릭하거나 호버하면 내용이 보입니다");
    } else {
        // 암기 모드 비활성화: 모든 노드 공개
        revealedNodes.clear();
        nodes.forEach(node => revealedNodes.add(node.id));
        updateStatusText("암기 모드 비활성화");
    }
    
    draw();
}

// HTML 순서: 13. btn-color
function openColorPicker() {
    if (selectedNodes.length === 0) {
        updateStatusText("노드를 먼저 선택해주세요");
        return;
    }
    const node = selectedNodes[0];
    
    // HTML5 color picker 사용
    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.value = node.color || "#2d89ef";
    colorInput.style.position = "fixed";
    colorInput.style.opacity = "0";
    colorInput.style.pointerEvents = "none";
    document.body.appendChild(colorInput);
    
    colorInput.addEventListener("change", (e) => {
        const color = e.target.value;
        selectedNodes.forEach(n => n.color = color);
        updateNodePanel();
        saveState();
        draw();
        document.body.removeChild(colorInput);
        updateStatusText("색상이 변경되었습니다");
    });
    
    colorInput.addEventListener("blur", () => {
        if (document.body.contains(colorInput)) {
            document.body.removeChild(colorInput);
        }
    });
    
    colorInput.click();
}

// HTML 순서: 14. btn-grid-toggle
function toggleGrid() {
    showGrid = !showGrid;
    const btn = document.getElementById("btn-grid-toggle");
    if (btn) {
        if (showGrid) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    }
    draw();
}

// 보드 색상 토글
function updateBoardColorIcon() {
    const btn = document.getElementById("btn-board-color");
    if (!btn) return;
    
    const icon = btn.querySelector(".icon");
    if (!icon) return;
    
    // 모든 스타일 초기화
    icon.style.backgroundImage = "none";
    icon.style.backgroundColor = "transparent";
    icon.style.border = "none";
    icon.style.backgroundSize = "auto";
    icon.style.borderRadius = "0";
    icon.style.width = "auto";
    icon.style.height = "auto";
    icon.style.display = "inline-block";
    
    if (boardColorMode === "white") {
        icon.textContent = "⬜";
    } else if (boardColorMode === "transparent") {
        // 투명 모드: 체크무늬 패턴을 나타내는 기호 사용
        icon.textContent = "◻️";
        // CSS로 체크무늬 배경 추가 (투명을 나타내는 패턴) - 더 명확하게
        icon.style.backgroundImage = "repeating-linear-gradient(45deg, rgba(180, 180, 180, 0.5) 0px, rgba(180, 180, 180, 0.5) 2px, transparent 2px, transparent 4px), repeating-linear-gradient(-45deg, rgba(180, 180, 180, 0.5) 0px, rgba(180, 180, 180, 0.5) 2px, transparent 2px, transparent 4px)";
        icon.style.backgroundSize = "4px 4px";
        icon.style.backgroundColor = "rgba(240, 240, 240, 0.3)";
        icon.style.border = "1px solid rgba(180, 180, 180, 0.6)";
        icon.style.borderRadius = "2px";
        icon.style.width = "13px";
        icon.style.height = "13px";
        icon.style.display = "inline-block";
    } else {
        // black 모드
        icon.textContent = "⬛";
    }
}

function toggleBoardColor() {
    if (boardColorMode === "black") {
        boardColorMode = "white";
    } else if (boardColorMode === "white") {
        boardColorMode = "transparent";
    } else {
        boardColorMode = "black";
    }
    
    // 아이콘 업데이트
    updateBoardColorIcon();
    
    // 즉시 반영을 위해 draw() 먼저 호출
    if (canvas && ctx) {
        draw();
    }
    saveState();
}

// HTML 순서: 14.5. btn-board
function openBoardPanel() {
    let panel = document.getElementById("board-panel");
    if (!panel) {
        createBoardPanel();
        panel = document.getElementById("board-panel");
    }
    if (panel) {
        panel.classList.remove("hidden");
        // 다른 패널 닫기
        const nodePanel = document.getElementById("node-panel");
        const connectionPanel = document.getElementById("connection-panel");
        if (nodePanel) nodePanel.classList.add("hidden");
        if (connectionPanel) connectionPanel.classList.add("hidden");
    }
}

// HTML 순서: 15. btn-fullscreen
function toggleFullscreen(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
    }
    
    // 브라우저 줌에 안전한 요소 확인
    const btn = document.getElementById('btn-fullscreen');
    if (btn && e) {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;
        // 실제 클릭 영역 확인
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            return;
        }
    }
    
    try {
        if (!window.api) {
            // 브라우저 환경에서는 표준 API 사용
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
            return;
        }
        
        if (window.api) {
            window.api.toggleFullscreen();
        }
    } catch (error) {
        console.error('Toggle fullscreen error:', error);
    }
}

// 보드 패널 생성 함수 (보드 버튼 제거로 인해 사용되지 않지만, 보드 배경 기능은 유지)
function createBoardPanel() {
    const panel = document.createElement('div');
    panel.id = "board-panel";
    panel.className = "node-panel";
    panel.innerHTML = `
        <div class="panel-header">
            <span>보드 설정</span>
            <div>
                <button class="panel-close" id="close-board-panel">✕</button>
            </div>
        </div>
        <div class="panel-content">
            <div class="form-group">
                <label>배경 색상</label>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="color" id="board-color" value="${boardColor}" style="width: 60px; height: 30px;">
                    <div id="board-color-preview" style="width: 40px; height: 40px; border: 1px solid #555; background-color: ${boardColor};"></div>
                </div>
            </div>
            <div class="form-group">
                <label>투명도</label>
                <input type="range" id="board-opacity" min="0" max="100" value="${boardOpacity * 100}" class="form-range">
                <span id="board-opacity-value">${Math.round(boardOpacity * 100)}%</span>
            </div>
            <div class="form-group">
                <label>배경 이미지</label>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <button id="board-image-load" class="form-button">이미지 불러오기</button>
                    <button id="board-image-remove" class="form-button" ${boardImage ? '' : 'style="display: none;"'}>이미지 제거</button>
                    ${boardImage ? `<div style="margin-top: 10px;"><img src="${boardImage}" style="max-width: 100%; max-height: 150px; border: 1px solid #555;"></div>` : ''}
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(panel);
    
    // 보드 색상 변경
    const boardColorInput = panel.querySelector('#board-color');
    const boardColorPreview = panel.querySelector('#board-color-preview');
    boardColorInput.addEventListener('input', (e) => {
        boardColor = e.target.value;
        boardColorPreview.style.backgroundColor = boardColor;
        draw();
        saveState();
    });
    
    // 보드 투명도 변경
    const boardOpacityInput = panel.querySelector('#board-opacity');
    const boardOpacityValue = panel.querySelector('#board-opacity-value');
    boardOpacityInput.addEventListener('input', (e) => {
        boardOpacity = e.target.value / 100;
        boardOpacityValue.textContent = Math.round(boardOpacity * 100) + '%';
        draw();
        saveState();
    });
    
    // 보드 이미지 불러오기
    const boardImageLoadBtn = panel.querySelector('#board-image-load');
    boardImageLoadBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                boardImage = e.target.result;
                boardImageObj = null; // 새 이미지 로드를 위해 초기화
                const removeBtn = panel.querySelector('#board-image-remove');
                removeBtn.style.display = 'block';
                
                // 이미지 미리보기 추가
                const preview = panel.querySelector('#board-image-load').parentElement;
                let imgPreview = preview.querySelector('img');
                if (!imgPreview) {
                    imgPreview = document.createElement('img');
                    imgPreview.style.cssText = 'max-width: 100%; max-height: 150px; border: 1px solid #555; margin-top: 10px;';
                    preview.appendChild(imgPreview);
                }
                imgPreview.src = boardImage;
                
                draw();
                saveState();
            };
            reader.readAsDataURL(file);
        };
        input.click();
    });
    
    // 보드 이미지 제거
    const boardImageRemoveBtn = panel.querySelector('#board-image-remove');
    boardImageRemoveBtn.addEventListener('click', () => {
        boardImage = null;
        boardImageObj = null;
        boardImageRemoveBtn.style.display = 'none';
        const imgPreview = panel.querySelector('img');
        if (imgPreview) {
            imgPreview.remove();
        }
        draw();
        saveState();
    });
    
    // 보드 패널 닫기 버튼
    const closeBoardPanelBtn = panel.querySelector('#close-board-panel');
    if (closeBoardPanelBtn) {
        closeBoardPanelBtn.addEventListener('click', () => {
            panel.classList.add('hidden');
        });
    }
    
    // 패널 드래그 설정
    setupPanelDrag();
}

// HTML 순서: 15. btn-help
function toggleHelpPanel() {
    const panel = document.getElementById("help-panel");
    if (panel) {
        panel.classList.toggle("hidden");
    }
}

// HTML 순서: 16. btn-minimize
function minimizeWindow(e) {
    console.log("최소화 버튼 클릭됨!"); // <-- 1. 이 메시지가 콘솔에 뜨는지 확인
    if (e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
    }
    
    // 전체화면 모드 감지 (동기적으로 빠르게 확인)
    const isFullscreen = !!document.fullscreenElement || 
                        !!document.webkitFullscreenElement || 
                        !!document.mozFullScreenElement || 
                        !!document.msFullscreenElement;
    
    // 브라우저 줌에 안전한 요소 확인 (전체화면 모드에서는 검증 건너뛰기)
    const btn = document.getElementById('btn-minimize');
    if (btn && e && !isFullscreen) {
        try {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX;
            const y = e.clientY;
            // 실제 클릭 영역 확인 (전체화면이 아닐 때만)
            if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                // 전체화면 모드가 아니면 정확한 클릭 영역 확인
                const actualElement = document.elementFromPoint(x, y);
                if (!actualElement || (!btn.contains(actualElement) && actualElement !== btn)) {
                    return;
                }
            }
        } catch (error) {
            // 검증 실패 시에도 계속 진행 (안전장치)
        }
    }
    
    try {
        if (window.api) {
            window.api.minimizeWindow();
        }
    } catch (error) {
        console.error('Minimize window error:', error);
    }
}

// HTML 순서: 23. btn-close
function closeApp(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
    }
    
    // 브라우저 줌에 안전한 요소 확인
    const btn = document.getElementById('btn-close');
    if (btn && e) {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;
        // 실제 클릭 영역 확인
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            return;
        }
    }
    
    try {
        // 앱 종료 전 자동 저장
        if (window.api && isModified && nodes.length > 0) {
            const data = {
                nodes: nodes,
                connections: connections,
                nodeGroups: nodeGroups || [],
                version: "2.0",
                timestamp: Date.now()
            };
            window.api.autoSave(JSON.stringify(data)).catch(err => {
                console.error('자동 저장 오류:', err);
            });
        }
        
        if (window.api) {
            window.api.quitApp();
        }
    } catch (error) {
        console.error('Close app error:', error);
    }
}


// ==================== 노드 패널 ====================
function openNodePanel(node) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:1121',message:'openNodePanel called',data:{nodeId:node?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    selectNode(node);
    const panel = document.getElementById("node-panel");
    if (panel) {
        panel.classList.remove("hidden");
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:1125',message:'openNodePanel: panel opened',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        updateNodePanel();
    } else {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:1129',message:'openNodePanel: panel not found',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
    }
}

function closeNodePanel() {
    document.getElementById("node-panel").classList.add("hidden");
}

// 연결선 패널 열기
function openConnectionPanel(connection) {
    selectedConnection = connection;
    const panel = document.getElementById("connection-panel");
    if (panel) {
        panel.classList.remove("hidden");
        updateConnectionPanel();
        setupPanelDrag(); // 패널 드래그 설정
    }
}

// 연결선 패널 닫기
function closeConnectionPanel() {
    selectedConnection = null;
    const panel = document.getElementById("connection-panel");
    if (panel) {
        panel.classList.add("hidden");
    }
}

// 연결선 패널 업데이트
function updateConnectionPanel() {
    if (!selectedConnection) return;
    
    const styleSelect = document.getElementById("connection-style");
    if (styleSelect) {
        styleSelect.value = selectedConnection.style || connectionLineStyle || 'solid';
    }
}

// 연결선 패널 이벤트 설정
function setupConnectionPanel() {
    const panel = document.getElementById("connection-panel");
    if (!panel) return;
    
    // 닫기 버튼
    const closeBtn = document.getElementById("close-connection-panel");
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            closeConnectionPanel();
            draw();
        });
    }
    
    // 저장 버튼
    const saveBtn = document.getElementById("save-connection");
    if (saveBtn) {
        saveBtn.addEventListener("click", () => {
            if (selectedConnection) {
                const styleSelect = document.getElementById("connection-style");
                if (styleSelect) {
                    selectedConnection.style = styleSelect.value;
                    saveState();
                    draw();
                    updateStatusText("연결선 스타일이 변경되었습니다");
                }
            }
        });
    }
    
    // 삭제 버튼
    const deleteBtn = document.getElementById("delete-connection");
    if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
            if (selectedConnection) {
                deleteConnection(selectedConnection.from, selectedConnection.to);
                closeConnectionPanel();
                updateStatusText("연결선이 삭제되었습니다");
            }
        });
    }
    
    // 스타일 변경 시 즉시 반영 (선택사항)
    const styleSelect = document.getElementById("connection-style");
    if (styleSelect) {
        styleSelect.addEventListener("change", () => {
            if (selectedConnection) {
                selectedConnection.style = styleSelect.value;
                draw();
            }
        });
    }
}

function updateNodePanel() {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:1132',message:'updateNodePanel called',data:{selectedCount:selectedNodes.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    if (selectedNodes.length !== 1) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:1134',message:'updateNodePanel: closing panel',data:{selectedCount:selectedNodes.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        closeNodePanel();
        return;
    }
    
    const node = selectedNodes[0];
    if (!node) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:1140',message:'updateNodePanel: node is null',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        closeNodePanel();
        return;
    }
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:1145',message:'updateNodePanel: updating fields',data:{nodeId:node.id,nodeText:node.text},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    // 안전하게 요소 가져오기
    const setValue = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.value = value;
    };
    
    const setText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };
    
    setValue("node-text", node.text || "");
    setValue("node-color", node.color || "#2d89ef");
    setValue("node-size", node.size || 30);
    setText("node-size-value", node.size || 30);
    setValue("node-font-size", node.fontSize || 14);
    setText("node-font-size-value", node.fontSize || 14);
    setValue("node-shape", node.shape || "circle");
    setValue("node-border", node.borderWidth || 2);
    setText("node-border-value", node.borderWidth || 2);
    setValue("node-opacity", Math.round((node.opacity || 0.9) * 100));
    setText("node-opacity-value", Math.round((node.opacity || 0.9) * 100) + "%");
    setValue("node-icon", node.icon || "");
    setValue("node-note", node.note || "");
    setValue("node-tags", (node.tags || []).join(", "));
    setValue("node-priority", node.priority || 3);
    setText("node-priority-value", node.priority || 3);
    setValue("node-progress", node.progress || 0);
    setText("node-progress-value", (node.progress || 0) + "%");
    setValue("node-link", node.link || "");
    
    // 이미지 미리보기 업데이트
    const imagePreview = document.getElementById("node-image-preview");
    const imageRemoveBtn = document.getElementById("node-image-remove");
    const imageAspectRatioGroup = document.getElementById("node-image-aspect-ratio-group");
    const imageAspectRatioSlider = document.getElementById("node-image-aspect-ratio");
    const imageAspectRatioValue = document.getElementById("node-image-aspect-ratio-value");
    
    if (imagePreview) {
        if (node.image) {
            imagePreview.innerHTML = `<img src="${node.image}" style="max-width: 100%; max-height: 150px; border: 1px solid #555; border-radius: 4px;">`;
            if (imageRemoveBtn) imageRemoveBtn.style.display = "block";
            if (imageAspectRatioGroup) imageAspectRatioGroup.style.display = "block";
            if (imageAspectRatioSlider) {
                imageAspectRatioSlider.value = node.imageAspectRatio || 1.0;
            }
            if (imageAspectRatioValue) {
                imageAspectRatioValue.textContent = (node.imageAspectRatio || 1.0).toFixed(1);
            }
        } else {
            imagePreview.innerHTML = "";
            if (imageRemoveBtn) imageRemoveBtn.style.display = "none";
            if (imageAspectRatioGroup) imageAspectRatioGroup.style.display = "none";
        }
    }
}

function saveNodeProperties() {
    // 이미 실시간으로 업데이트되므로 저장만
    saveState();
    draw();
}

// ==================== 컨텍스트 메뉴 ====================
function applyLineStyle(style) {
    if (selectedConnection) {
        selectedConnection.style = style;
        saveState();
        draw();
    } else if (selectedNodes.length > 0) {
        // 선택된 노드의 모든 연결선에 적용
        selectedNodes.forEach(node => {
            connections.forEach(conn => {
                if (conn.from === node.id || conn.to === node.id) {
                    conn.style = style;
                }
            });
        });
        saveState();
        draw();
    } else {
        console.warn("applyLineStyle: No selected nodes or connection");
    }
}

function applyNodeColor(color) {
    if (selectedNodes.length > 0) {
        selectedNodes.forEach(node => {
            // 노드 객체 직접 수정
            node.color = color;
            // nodes 배열에서도 업데이트 (동기화)
            const nodeInArray = nodes.find(n => n.id === node.id);
            if (nodeInArray) {
                nodeInArray.color = color;
            }
        });
        saveState();
        draw();
    } else {
        console.warn("applyNodeColor: No selected nodes");
    }
}

function applyNodeSize(size) {
    if (selectedNodes.length > 0) {
        selectedNodes.forEach(node => {
            // 노드 객체 직접 수정
            node.size = size;
            // nodes 배열에서도 업데이트 (동기화)
            const nodeInArray = nodes.find(n => n.id === node.id);
            if (nodeInArray) {
                nodeInArray.size = size;
            }
        });
        saveState();
        draw();
    } else {
        console.warn("applyNodeSize: No selected nodes");
    }
}

function applyNodeShape(shape) {
    if (selectedNodes.length > 0) {
        selectedNodes.forEach(node => {
            // 노드 객체 직접 수정
            node.shape = shape;
            // nodes 배열에서도 업데이트 (동기화)
            const nodeInArray = nodes.find(n => n.id === node.id);
            if (nodeInArray) {
                nodeInArray.shape = shape;
            }
        });
        saveState();
        draw();
    } else {
        console.warn("applyNodeShape: No selected nodes");
    }
}

function handleContextAction(action) {
    if (selectedNodes.length === 0) return;
    const node = selectedNodes[0];
    
    switch (action) {
        case "edit":
            openNodePanel(node);
            break;
        case "duplicate":
            duplicateNode(node);
            break;
        case "delete":
            deleteNode(node);
            break;
        case "color":
            openColorPicker();
            break;
        case "size":
            // 크기 조절은 패널에서
            openNodePanel(node);
            break;
        case "shape":
            // 모양 변경은 패널에서
            openNodePanel(node);
            break;
        case "connect":
            connectFrom = node;
            isConnecting = true;
            const btn = document.getElementById("btn-connect");
            if (btn) btn.classList.add("active");
            if (canvas) canvas.classList.add("connecting");
            break;
        case "disconnect":
            // 연결된 모든 연결 삭제
            connections = connections.filter(c => c.from !== node.id && c.to !== node.id);
            updateConnectionCount();
            saveState();
            draw();
            break;
        case "note":
            openNodePanel(node);
            break;
        case "link":
            openNodePanel(node);
            break;
        case "center":
            centerOnNode(node);
            break;
        case "align":
            alignSelectedNodes();
            break;
        case "group":
            groupSelectedNodes();
            break;
        case "ungroup":
            ungroupSelectedNodes();
            break;
    }
}

// 전역 mousemove 핸들러 설정 (마우스 통과 모드 활성화 시)
function setupGlobalMouseMoveHandler() {
    if (globalMouseMoveHandler) {
        return; // 이미 설정됨
    }
    
    globalMouseMoveHandler = (e) => {
        if (!mouseEventsIgnored) {
            return; // 마우스 통과 모드가 비활성화되면 무시
        }
        
        // 마우스 위치에서 요소 확인
        const target = document.elementFromPoint(e.clientX, e.clientY);
        
        // toolbar, node-panel, help-panel 위에 있는지 확인
        const isOverToolbar = target && target.closest('.toolbar');
        const isOverPanel = target && target.closest('.node-panel, .help-panel');
        
        // 캔버스 위에 노드가 있는지 확인
        let isOverNode = false;
        if (canvas && target === canvas) {
            const rect = canvas.getBoundingClientRect();
            const canvasX = e.clientX - rect.left;
            const canvasY = e.clientY - rect.top;
            const pos = {
                x: (canvasX - panX) / zoom,
                y: (canvasY - panY) / zoom
            };
            const node = hitTest(pos.x, pos.y);
            isOverNode = !!node;
        }
        
        // toolbar, panel, 또는 노드 위에 있으면 마우스 이벤트 활성화
        if (isOverToolbar || isOverPanel || isOverNode) {
            if (window.api) window.api.setIgnoreMouseEvents(false);
        } else {
            // 빈 공간에서는 마우스 이벤트 통과 (forward 옵션으로 위치 정보는 계속 받음)
            if (window.api) window.api.setIgnoreMouseEvents(true, { forward: true });
        }
    };
    
    document.addEventListener('mousemove', globalMouseMoveHandler, true); // capture phase
}

// 전역 mousemove 핸들러 제거
function removeGlobalMouseMoveHandler() {
    if (globalMouseMoveHandler) {
        document.removeEventListener('mousemove', globalMouseMoveHandler, true);
        globalMouseMoveHandler = null;
    }
}



function centerOnNode(node) {
    if (!canvas || !node) return;
    panX = canvas.width / 2 - node.x * zoom;
    panY = canvas.height / 2 - node.y * zoom;
    draw();
}

function moveSelected(dx, dy) {
    selectedNodes.forEach(node => {
        node.x += dx;
        node.y += dy;
    });
    saveState();
    draw();
}

// ==================== 검색 ====================
function calculateSimilarity(str1, str2) {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    
    // 완전 일치
    if (s1 === s2) return 1.0;
    
    // 포함 관계
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;
    
    // 레벤슈타인 거리 기반 유사도
    const maxLen = Math.max(s1.length, s2.length);
    if (maxLen === 0) return 1.0;
    
    const distance = levenshteinDistance(s1, s2);
    return 1 - (distance / maxLen);
}

function levenshteinDistance(str1, str2) {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[str2.length][str1.length];
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    const dropdown = document.getElementById("search-results-dropdown");
    const searchInput = document.getElementById("search-input");
    
    if (!query) {
        searchResults = [];
        searchIndex = -1;
        if (dropdown) dropdown.classList.add("hidden");
        draw();
        return;
    }
    
    // 정확한 일치 검색
    const exactMatches = nodes.filter(node => 
        node.text.toLowerCase().includes(query) ||
        (node.note && node.note.toLowerCase().includes(query)) ||
        (node.tags && node.tags.some(tag => tag.toLowerCase().includes(query)))
    );
    
    // 유사한 단어 검색 (정확한 일치 제외)
    const similarNodes = nodes
        .filter(node => !exactMatches.includes(node))
        .map(node => {
            const textSim = calculateSimilarity(query, node.text);
            const noteSim = node.note ? calculateSimilarity(query, node.note) : 0;
            const tagSim = node.tags ? Math.max(...node.tags.map(tag => calculateSimilarity(query, tag))) : 0;
            const similarity = Math.max(textSim, noteSim, tagSim);
            return { node, similarity };
        })
        .filter(item => item.similarity > 0.3) // 유사도 30% 이상
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5) // 최대 5개
        .map(item => item.node);
    
    searchResults = exactMatches;
    
    // 검색 결과 드롭다운 표시
    if (dropdown && searchInput) {
        if (similarNodes.length > 0) {
            dropdown.innerHTML = similarNodes.map(node => 
                `<div class="search-result-item" data-node-id="${node.id}">${node.text}</div>`
            ).join('');
            dropdown.classList.remove("hidden");
            
            // 드롭다운 위치 설정
            const rect = searchInput.getBoundingClientRect();
            dropdown.style.top = (rect.bottom + 5) + "px";
            dropdown.style.left = rect.left + "px";
            dropdown.style.width = rect.width + "px";
            
            // 클릭 이벤트
            dropdown.querySelectorAll(".search-result-item").forEach(item => {
                item.addEventListener("click", () => {
                    const nodeId = parseInt(item.dataset.nodeId);
                    const node = nodes.find(n => n.id === nodeId);
                    if (node) {
                        centerOnNode(node);
                        selectNode(node);
                        searchInput.value = node.text;
                        dropdown.classList.add("hidden");
                    }
                });
            });
        } else {
            dropdown.classList.add("hidden");
        }
    }
    
    searchIndex = searchResults.length > 0 ? 0 : -1;
    highlightSearchResults();
}

function navigateSearch(direction) {
    if (searchResults.length === 0) return;
    searchIndex = (searchIndex + direction + searchResults.length) % searchResults.length;
    const node = searchResults[searchIndex];
    centerOnNode(node);
    selectNode(node);
    highlightSearchResults();
}

function highlightSearchResults() {
    // 검색 결과 하이라이트 (필요시 구현)
    draw();
}

// ==================== 히스토리 (실행 취소/다시 실행) ====================
function saveState() {
    const state = {
        nodes: JSON.parse(JSON.stringify(nodes)),
        connections: JSON.parse(JSON.stringify(connections))
    };
    
    history = history.slice(0, historyIndex + 1);
    history.push(state);
    historyIndex++;
    
    // 히스토리 제한
    if (history.length > 50) {
        history.shift();
        historyIndex--;
    }
    
    // 데이터 변경 플래그 설정
    isModified = true;
}

// ==================== 클립보드 ====================
function copySelected() {
    if (selectedNodes.length === 0) return;
    const data = {
        nodes: selectedNodes.map(n => ({ ...n })),
        timestamp: Date.now()
    };
    localStorage.setItem("mindmap_clipboard", JSON.stringify(data));
}

function pasteNodes() {
    const data = localStorage.getItem("mindmap_clipboard");
    if (!data) return;
    
    try {
        const clipboard = JSON.parse(data);
        const offset = 50;
        clipboard.nodes.forEach((node, i) => {
            const newNode = {
                ...node,
                id: nextNodeId++,
                x: node.x + offset,
                y: node.y + offset,
                text: node.text + " (복사)"
            };
            nodes.push(newNode);
        });
        updateNodeCount();
        saveState();
        draw();
    } catch (e) {
        console.error("붙여넣기 실패:", e);
    }
}

// ==================== 파일 저장/불러오기 ====================
let currentFilePath = null;
let autoSaveInterval = null;
let isModified = false;

async function loadRecentOrAutosave() {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:1952',message:'loadRecentOrAutosave started',data:{apiExists:!!window.api},timestamp:Date.now(),sessionId:'debug-session',runId:'timing',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    if (!window.api) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:1955',message:'loadRecentOrAutosave: window.api is null',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'timing',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        return;
    }
    
    try {
        // 먼저 최근 파일 시도
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:1962',message:'loadRecentOrAutosave: calling load-recent-file',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'timing',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        const recentResult = await window.api.loadRecentFile();
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:1965',message:'loadRecentOrAutosave: load-recent-file result',data:{success:recentResult?.success},timestamp:Date.now(),sessionId:'debug-session',runId:'timing',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        if (recentResult.success) {
            await loadData(JSON.parse(recentResult.data), recentResult.filePath);
            return;
        }
        
        // 최근 파일이 없으면 자동 저장 파일 시도
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:1972',message:'loadRecentOrAutosave: calling load-autosave',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'timing',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        const autosaveResult = await window.api.loadAutosave();
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:1975',message:'loadRecentOrAutosave: load-autosave result',data:{success:autosaveResult?.success},timestamp:Date.now(),sessionId:'debug-session',runId:'timing',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        if (autosaveResult.success) {
            const load = confirm('자동 저장된 파일이 있습니다. 불러오시겠습니까?');
            if (load) {
                await loadData(JSON.parse(autosaveResult.data));
            }
        }
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:1983',message:'loadRecentOrAutosave: completed successfully',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'timing',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
    } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d6c25c6-0806-46be-b644-26ddfd9f7dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'renderer.js:1986',message:'loadRecentOrAutosave: error caught',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'timing',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        console.error('파일 불러오기 오류:', error);
    }
}

async function loadData(data, filePath = null) {
    if (!data) return;
    
    // boardColorMode와 boardOpacity 로드
    if (data.boardColorMode) {
        boardColorMode = data.boardColorMode;
        updateBoardColorIcon();
    }
    if (data.boardOpacity !== undefined) {
        boardOpacity = data.boardOpacity;
        const slider = document.getElementById("board-opacity-slider");
        const opacityValue = document.getElementById("board-opacity-value");
        if (slider) {
            slider.value = boardOpacity * 100;
        }
        if (opacityValue) {
            opacityValue.textContent = Math.round(boardOpacity * 100) + "%";
        }
    }
    
    try {
        nodes = data.nodes || [];
        connections = data.connections || [];
        nodeGroups = data.nodeGroups || [];
        
        if (data.zoom !== undefined) zoom = data.zoom;
        if (data.panX !== undefined) panX = data.panX;
        if (data.panY !== undefined) panY = data.panY;
        
        // nextNodeId 업데이트
        if (nodes.length > 0) {
            nextNodeId = Math.max(...nodes.map(n => n.id || 0), 0) + 1;
        } else {
            nextNodeId = 0;
        }
        
        currentFilePath = filePath;
        selectedNodes = [];
        updateNodeCount();
        updateConnectionCount();
        closeNodePanel();
        
        const zoomSlider = document.getElementById("zoom-slider");
        const zoomValue = document.getElementById("zoom-value");
        if (zoomSlider) zoomSlider.value = zoom * 100;
        if (zoomValue) zoomValue.textContent = Math.round(zoom * 100) + "%";
        
        saveState();
        draw();
        isModified = false;
        
        if (filePath) {
            updateStatusText(`파일 열기 완료: ${filePath.split(/[/\\]/).pop()}`);
        }
    } catch (error) {
        console.error('데이터 로드 오류:', error);
        alert('파일을 불러오는 중 오류가 발생했습니다.');
    }
}

function startAutoSave() {
    if (!window.api) return;
    
    // 30초마다 자동 저장
    autoSaveInterval = setInterval(async () => {
        if (isModified && nodes.length > 0) {
            const data = {
                nodes: nodes,
                connections: connections,
                nodeGroups: nodeGroups || [],
                version: "2.0",
                timestamp: Date.now()
            };
            
            try {
                await window.api.autoSave(JSON.stringify(data));
            } catch (error) {
                console.error('자동 저장 오류:', error);
            }
        }
    }, 30000);
}

function updateStatusText(message) {
    const statusEl = document.getElementById("status-text");
    if (statusEl) {
        statusEl.textContent = message || "준비";
        if (message) {
            setTimeout(() => {
                if (statusEl) statusEl.textContent = "준비";
            }, 3000);
        }
    }
}


// ==================== 내보내기/가져오기 ====================
function exportData() {
    const data = {
        nodes: nodes,
        connections: connections,
        version: "1.0",
        timestamp: Date.now()
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mindmap_" + new Date().toISOString().slice(0, 10) + ".json";
    a.click();
    URL.revokeObjectURL(url);
}

function importData() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.nodes && Array.isArray(data.nodes)) {
                    nodes = data.nodes;
                    connections = data.connections || [];
                    // nextNodeId 업데이트 (빈 배열 처리)
                    if (nodes.length > 0) {
                        nextNodeId = Math.max(...nodes.map(n => n.id || 0), 0) + 1;
                    } else {
                        nextNodeId = 0;
                    }
                    selectedNodes = [];
                    updateNodeCount();
                    updateConnectionCount();
                    closeNodePanel();
                    saveState();
                    zoomToFit();
                } else {
                    alert("잘못된 파일 형식입니다.");
                }
            } catch (err) {
                alert("파일을 읽을 수 없습니다: " + err.message);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// ==================== 상태 업데이트 ====================
function updateStatus() {
    updateNodeCount();
    updateConnectionCount();
}

function updateNodeCount() {
    const el = document.getElementById("node-count");
    if (el) el.textContent = `노드: ${nodes.length}`;
}

function updateConnectionCount() {
    const el = document.getElementById("connection-count");
    if (el) el.textContent = `연결: ${connections.length}`;
}

function updatePositionInfo(pos) {
    if (!pos) return;
    const el = document.getElementById("position-info");
    if (el) el.textContent = `X: ${Math.round(pos.x)}, Y: ${Math.round(pos.y)}`;
}

// ==================== 미구현 기능 구현 ====================

// 그룹화 기능
let nodeGroups = [];
let nextGroupId = 0;

function groupSelectedNodes() {
    if (selectedNodes.length < 2) return;
    const group = {
        id: nextGroupId++,
        nodes: [...selectedNodes],
        color: "rgba(255, 255, 0, 0.1)",
        name: `그룹 ${nextGroupId}`
    };
    nodeGroups.push(group);
    selectedNodes.forEach(node => {
        node.groupId = group.id;
    });
    saveState();
    draw();
}

function ungroupSelectedNodes() {
    if (selectedNodes.length === 0) return;
    const groupIds = new Set(selectedNodes.map(n => n.groupId).filter(id => id !== undefined));
    groupIds.forEach(gid => {
        nodeGroups = nodeGroups.filter(g => g.id !== gid);
        nodes.forEach(n => {
            if (n.groupId === gid) n.groupId = undefined;
        });
    });
    saveState();
    draw();
}

// 정렬 기능
function alignSelectedNodes(alignment) {
    if (selectedNodes.length < 2) {
        alert("정렬하려면 최소 2개 이상의 노드를 선택해야 합니다.");
        return;
    }
    
    if (!alignment) {
        // 이전 방식: prompt 사용 (하위 호환성)
        alignment = prompt("정렬 방식: left, right, top, bottom, center, horizontal, vertical", "horizontal");
        if (!alignment) return;
    }
    
    const bounds = getSelectedBounds();
    if (!bounds) return;
    
    selectedNodes.forEach(node => {
        switch(alignment.toLowerCase()) {
            case "left":
                node.x = bounds.minX;
                break;
            case "right":
                node.x = bounds.maxX;
                break;
            case "top":
                node.y = bounds.minY;
                break;
            case "bottom":
                node.y = bounds.maxY;
                break;
            case "center":
                node.x = bounds.centerX;
                node.y = bounds.centerY;
                break;
            case "horizontal":
                node.y = bounds.centerY;
                break;
            case "vertical":
                node.x = bounds.centerX;
                break;
        }
    });
    saveState();
    draw();
}

// 정렬 메뉴 설정 (overlay-root 사용)
function setupAlignMenu() {
    const alignBtn = document.getElementById("btn-align");
    const overlayRoot = document.getElementById("overlay-root");
    
    if (!alignBtn || !overlayRoot) return;
    
    // 정렬 메뉴 요소 생성 (overlay-root에 추가)
    const alignMenu = document.createElement("div");
    alignMenu.id = "align-menu";
    alignMenu.className = "align-menu hidden";
    alignMenu.innerHTML = `
        <button class="align-menu-item" data-align="left">⬅ 왼쪽</button>
        <button class="align-menu-item" data-align="right">➡ 오른쪽</button>
        <button class="align-menu-item" data-align="top">⬆ 위</button>
        <button class="align-menu-item" data-align="bottom">⬇ 아래</button>
        <button class="align-menu-item" data-align="center">⬌ 중앙</button>
        <button class="align-menu-item" data-align="horizontal">━ 수평</button>
        <button class="align-menu-item" data-align="vertical">┃ 수직</button>
    `;
    
    overlayRoot.appendChild(alignMenu);
    
    // 정렬 버튼 클릭 시 메뉴 토글
    alignBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        if (selectedNodes.length < 2) {
            alert("정렬하려면 최소 2개 이상의 노드를 선택해야 합니다.");
            return;
        }
        
        // 버튼 위치만 사용 (보정 없음)
        const btnRect = alignBtn.getBoundingClientRect();
        
        // 메뉴를 버튼 아래에 표시
        let menuX = btnRect.left;
        let menuY = btnRect.bottom + 4;
        
        // 화면 경계 체크만 수행
        alignMenu.classList.remove("hidden");
        const menuRect = alignMenu.getBoundingClientRect();
        if (menuX + menuRect.width > window.innerWidth) {
            menuX = window.innerWidth - menuRect.width - 10;
        }
        if (menuX < 0) menuX = 10;
        if (menuY + menuRect.height > window.innerHeight) {
            menuY = btnRect.top - menuRect.height - 4;
        }
        if (menuY < 0) menuY = 10;
        
        alignMenu.style.left = menuX + "px";
        alignMenu.style.top = menuY + "px";
    });
    
    // 정렬 메뉴 항목 클릭
    const alignItems = alignMenu.querySelectorAll(".align-menu-item");
    alignItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            
            const alignment = item.dataset.align;
            if (alignment) {
                alignSelectedNodes(alignment);
                alignMenu.classList.add("hidden");
            }
        });
        item.addEventListener('mousedown', (e) => e.stopPropagation());
        item.addEventListener('mouseup', (e) => e.stopPropagation());
    });
    
    // 메뉴 외부 클릭 시 닫기
    document.addEventListener("click", (e) => {
        if (!alignMenu.contains(e.target) && e.target !== alignBtn && !alignMenu.classList.contains("hidden")) {
            alignMenu.classList.add("hidden");
        }
    }, true);
    
    // 단축키 설정
    document.addEventListener("keydown", (e) => {
        if (selectedNodes.length < 2) return;
        
        if (e.ctrlKey && e.shiftKey) {
            let alignment = null;
            switch(e.key.toLowerCase()) {
                case 'l':
                    alignment = 'left';
                    break;
                case 'r':
                    alignment = 'right';
                    break;
                case 't':
                    alignment = 'top';
                    break;
                case 'b':
                    alignment = 'bottom';
                    break;
                case 'h':
                    alignment = 'horizontal';
                    break;
                case 'v':
                    alignment = 'vertical';
                    break;
            }
            
            if (alignment) {
                e.preventDefault();
                e.stopPropagation();
                alignSelectedNodes(alignment);
            }
        }
    });
}

function getSelectedBounds() {
    if (selectedNodes.length === 0) return null;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    selectedNodes.forEach(node => {
        const size = node.size || 30;
        minX = Math.min(minX, node.x - size);
        minY = Math.min(minY, node.y - size);
        maxX = Math.max(maxX, node.x + size);
        maxY = Math.max(maxY, node.y + size);
    });
    return {
        minX, minY, maxX, maxY,
        centerX: (minX + maxX) / 2,
        centerY: (minY + maxY) / 2,
        width: maxX - minX,
        height: maxY - minY
    };
}

// 링크 열기
function openNodeLink(node) {
    if (!node || !node.link) return;
    if (typeof require !== 'undefined') {
        // 보안: preload.js를 통해 안전하게 외부 링크 열기
        if (window.api) {
            window.api.openExternal(node.link);
        } else {
            // 폴백: 브라우저 환경
            window.open(node.link, '_blank');
        }
    } else {
        window.open(node.link, '_blank');
    }
}

// 설정 패널 생성
// ==================== 50가지 새로운 기능 ====================

// 5. 모든 노드 선택
function selectAllNodes() {
    selectedNodes = [...nodes];
    updateNodePanel();
    draw();
}

// 6. 선택 해제
function deselectAll() {
    clearSelection();
}

// 7. 역선택 (선택된 것 제외하고 모두 선택)
function invertSelection() {
    selectedNodes = nodes.filter(n => !selectedNodes.includes(n));
    updateNodePanel();
    draw();
}

// 8. 노드 이름으로 검색하여 선택
function selectNodesByName(query) {
    const matches = nodes.filter(n => n.text.toLowerCase().includes(query.toLowerCase()));
    selectedNodes = matches;
    updateNodePanel();
    draw();
}

// 9. 태그로 필터링
function filterByTag(tag) {
    const matches = nodes.filter(n => n.tags && n.tags.includes(tag));
    selectedNodes = matches;
    updateNodePanel();
    draw();
}

// 10. 우선순위로 필터링
function filterByPriority(minPriority) {
    const matches = nodes.filter(n => (n.priority || 3) >= minPriority);
    selectedNodes = matches;
    updateNodePanel();
    draw();
}

// 11. 진행률로 필터링
function filterByProgress(minProgress) {
    const matches = nodes.filter(n => (n.progress || 0) >= minProgress);
    selectedNodes = matches;
    updateNodePanel();
    draw();
}

// 12. 노드 크기 일괄 변경
function resizeSelectedNodes(newSize) {
    selectedNodes.forEach(node => {
        node.size = newSize;
    });
    updateNodePanel();
    saveState();
    draw();
}

// 13. 노드 색상 일괄 변경
function recolorSelectedNodes(color) {
    selectedNodes.forEach(node => {
        node.color = color;
    });
    updateNodePanel();
    saveState();
    draw();
}

// 14. 노드 모양 일괄 변경
function reshapeSelectedNodes(shape) {
    selectedNodes.forEach(node => {
        node.shape = shape;
    });
    updateNodePanel();
    saveState();
    draw();
}

// 15. 노드 복사 (여러 개)
function duplicateSelectedNodes() {
    const newNodes = [];
    selectedNodes.forEach(node => {
        const newNode = duplicateNode(node);
        newNodes.push(newNode);
    });
    selectedNodes = newNodes;
    updateNodePanel();
    draw();
}

// 16. 노드 삭제 (선택된 것들)
function deleteSelectedNodes() {
    deleteSelected();
}

// 17. 노드 병합 (여러 노드를 하나로)
function mergeSelectedNodes() {
    if (selectedNodes.length < 2) return;
    const first = selectedNodes[0];
    const texts = selectedNodes.map(n => n.text).join(", ");
    first.text = texts;
    first.note = selectedNodes.map(n => n.note).filter(n => n).join("\n\n");
    first.tags = [...new Set(selectedNodes.flatMap(n => n.tags || []))];
    
    // 나머지 노드 삭제
    selectedNodes.slice(1).forEach(node => deleteNode(node));
    selectedNodes = [first];
    updateNodePanel();
    saveState();
    draw();
}

// 18. 노드 분할 (텍스트를 여러 노드로)
function splitNode(node, separator = ",") {
    if (!node) node = selectedNodes[0];
    if (!node) return;
    const parts = node.text.split(separator).map(s => s.trim()).filter(s => s);
    if (parts.length < 2) return;
    
    const newNodes = [];
    parts.forEach((part, i) => {
        const newNode = {
            ...node,
            id: nextNodeId++,
            text: part,
            x: node.x + (i - parts.length / 2) * 100,
            y: node.y + 80
        };
        nodes.push(newNode);
        newNodes.push(newNode);
    });
    
    deleteNode(node);
    selectedNodes = newNodes;
    updateNodeCount();
    saveState();
    draw();
}

// 19. 노드 연결 (선택된 노드들을 순서대로)
function connectSelectedNodes() {
    if (selectedNodes.length < 2) return;
    for (let i = 0; i < selectedNodes.length - 1; i++) {
        createConnection(selectedNodes[i].id, selectedNodes[i + 1].id);
    }
    saveState();
    draw();
}

// 20. 노드 연결 해제 (선택된 노드들의 모든 연결)
function disconnectSelectedNodes() {
    selectedNodes.forEach(node => {
        connections = connections.filter(c => c.from !== node.id && c.to !== node.id);
    });
    updateConnectionCount();
    saveState();
    draw();
}

// 21. 노드 거리 계산
function calculateDistance(node1, node2) {
    return Math.hypot(node2.x - node1.x, node2.y - node1.y);
}

// 22. 가장 가까운 노드 찾기
function findNearestNode(node) {
    if (!node) node = selectedNodes[0];
    if (!node) return null;
    let nearest = null;
    let minDist = Infinity;
    nodes.forEach(other => {
        if (other === node) return;
        const dist = calculateDistance(node, other);
        if (dist < minDist) {
            minDist = dist;
            nearest = other;
        }
    });
    return nearest;
}

// 23. 노드 경로 찾기 (두 노드 간)
function findPath(fromId, toId) {
    const visited = new Set();
    const queue = [{ id: fromId, path: [fromId] }];
    
    while (queue.length > 0) {
        const current = queue.shift();
        if (current.id === toId) return current.path;
        if (visited.has(current.id)) continue;
        visited.add(current.id);
        
        connections.forEach(conn => {
            if (conn.from === current.id && !visited.has(conn.to)) {
                queue.push({ id: conn.to, path: [...current.path, conn.to] });
            }
        });
    }
    return null;
}

// 24. 노드 통계
function getNodeStatistics() {
    return {
        total: nodes.length,
        withLinks: nodes.filter(n => n.link).length,
        withNotes: nodes.filter(n => n.note).length,
        withTags: nodes.filter(n => n.tags && n.tags.length > 0).length,
        highPriority: nodes.filter(n => (n.priority || 3) > 3).length,
        inProgress: nodes.filter(n => (n.progress || 0) > 0 && n.progress < 100).length,
        completed: nodes.filter(n => n.progress === 100).length
    };
}

// 25. 노드 내보내기 (선택된 것들)
function exportSelectedNodes() {
    if (selectedNodes.length === 0) return;
    const data = {
        nodes: selectedNodes.map(n => ({ ...n })),
        timestamp: Date.now()
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "selected_nodes_" + new Date().toISOString().slice(0, 10) + ".json";
    a.click();
    URL.revokeObjectURL(url);
}

// 26. 노드 가져오기 (JSON 파일에서)
function importNodesFromFile() {
    importData();
}

// 27. 노드 텍스트 검색 및 바꾸기
function findAndReplace(search, replace) {
    nodes.forEach(node => {
        if (node.text.includes(search)) {
            node.text = node.text.replace(new RegExp(search, 'g'), replace);
        }
        if (node.note && node.note.includes(search)) {
            node.note = node.note.replace(new RegExp(search, 'g'), replace);
        }
    });
    saveState();
    draw();
}

// 28. 노드 텍스트 대소문자 변환
function transformTextCase(mode) {
    selectedNodes.forEach(node => {
        switch(mode) {
            case 'upper':
                node.text = node.text.toUpperCase();
                break;
            case 'lower':
                node.text = node.text.toLowerCase();
                break;
            case 'title':
                node.text = node.text.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
                break;
        }
    });
    updateNodePanel();
    saveState();
    draw();
}

// 29. 노드 텍스트 길이 제한
function truncateNodeTexts(maxLength) {
    nodes.forEach(node => {
        if (node.text.length > maxLength) {
            node.text = node.text.substring(0, maxLength) + '...';
        }
    });
    saveState();
    draw();
}

// 30. 노드 랜덤 색상
function randomizeNodeColors() {
    const colors = ['#2d89ef', '#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf', '#ff8b94', '#95e1d3', '#f38181'];
    selectedNodes.forEach(node => {
        node.color = colors[Math.floor(Math.random() * colors.length)];
    });
    updateNodePanel();
    saveState();
    draw();
}

// 31. 노드 랜덤 위치
function randomizeNodePositions() {
    if (!canvas) return;
    selectedNodes.forEach(node => {
        node.x = Math.random() * canvas.width;
        node.y = Math.random() * canvas.height;
    });
    saveState();
    draw();
}

// 32. 노드 정렬 (X 좌표)
function sortNodesByX() {
    nodes.sort((a, b) => a.x - b.x);
    saveState();
    draw();
}

// 33. 노드 정렬 (Y 좌표)
function sortNodesByY() {
    nodes.sort((a, b) => a.y - b.y);
    saveState();
    draw();
}

// 34. 노드 정렬 (이름)
function sortNodesByName() {
    nodes.sort((a, b) => a.text.localeCompare(b.text));
    saveState();
    draw();
}

// 35. 노드 정렬 (우선순위)
function sortNodesByPriority() {
    nodes.sort((a, b) => (b.priority || 3) - (a.priority || 3));
    saveState();
    draw();
}

// 36. 노드 정렬 (진행률)
function sortNodesByProgress() {
    nodes.sort((a, b) => (b.progress || 0) - (a.progress || 0));
    saveState();
    draw();
}

// 37. 노드 그룹화 (색상별)
function groupNodesByColor() {
    const colorGroups = {};
    nodes.forEach(node => {
        const color = node.color || '#2d89ef';
        if (!colorGroups[color]) colorGroups[color] = [];
        colorGroups[color].push(node);
    });
    console.log("색상별 그룹:", colorGroups);
}

// 38. 노드 그룹화 (태그별)
function groupNodesByTag() {
    const tagGroups = {};
    nodes.forEach(node => {
        (node.tags || []).forEach(tag => {
            if (!tagGroups[tag]) tagGroups[tag] = [];
            tagGroups[tag].push(node);
        });
    });
    console.log("태그별 그룹:", tagGroups);
}

// 39. 노드 통계 표시
function showNodeStatistics() {
    const stats = getNodeStatistics();
    alert(`노드 통계:\n총 노드: ${stats.total}\n링크 있음: ${stats.withLinks}\n메모 있음: ${stats.withNotes}\n태그 있음: ${stats.withTags}\n높은 우선순위: ${stats.highPriority}\n진행 중: ${stats.inProgress}\n완료: ${stats.completed}`);
}

// 40. 노드 미리보기 (큰 화면)
function previewNode(node) {
    if (!node) node = selectedNodes[0];
    if (!node) return;
    const preview = window.open('', '_blank', 'width=800,height=600');
    preview.document.write(`
        <html>
        <head><title>${node.text}</title></head>
        <body style="font-family: Arial; padding: 20px;">
            <h1>${node.text}</h1>
            ${node.note ? `<p>${node.note.replace(/\n/g, '<br>')}</p>` : ''}
            ${node.link ? `<p><a href="${node.link}">${node.link}</a></p>` : ''}
            ${node.tags && node.tags.length > 0 ? `<p>태그: ${node.tags.join(', ')}</p>` : ''}
            <p>우선순위: ${node.priority || 3}</p>
            <p>진행률: ${node.progress || 0}%</p>
        </body>
        </html>
    `);
}

// 41. 노드 인쇄
function printNodes() {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head><title>마인드맵 인쇄</title></head>
        <body style="font-family: Arial; padding: 20px;">
            <h1>마인드맵</h1>
            ${nodes.map(node => `
                <div style="margin: 10px; padding: 10px; border: 1px solid #ccc;">
                    <h2>${node.text}</h2>
                    ${node.note ? `<p>${node.note.replace(/\n/g, '<br>')}</p>` : ''}
                    ${node.tags && node.tags.length > 0 ? `<p>태그: ${node.tags.join(', ')}</p>` : ''}
                </div>
            `).join('')}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// 42. 노드 복사 (텍스트 형식)
function copyNodesAsText() {
    const text = selectedNodes.map(n => n.text).join('\n');
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
    } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
}

// 43. 노드 복사 (마크다운 형식)
function copyNodesAsMarkdown() {
    const markdown = selectedNodes.map(n => {
        let md = `## ${n.text}\n`;
        if (n.note) md += `${n.note}\n`;
        if (n.tags && n.tags.length > 0) md += `태그: ${n.tags.join(', ')}\n`;
        return md;
    }).join('\n');
    if (navigator.clipboard) {
        navigator.clipboard.writeText(markdown);
    }
}

// 44. 노드 복사 (HTML 형식)
function copyNodesAsHTML() {
    const html = selectedNodes.map(n => {
        return `<div><h2>${n.text}</h2>${n.note ? `<p>${n.note}</p>` : ''}</div>`;
    }).join('\n');
    if (navigator.clipboard) {
        navigator.clipboard.writeText(html);
    }
}

// 45. 노드 링크 일괄 추가
function addLinksToSelected(urlTemplate) {
    selectedNodes.forEach((node, i) => {
        node.link = urlTemplate.replace('{text}', encodeURIComponent(node.text)).replace('{index}', i);
    });
    updateNodePanel();
    saveState();
    draw();
}

// 46. 노드 태그 일괄 추가
function addTagsToSelected(tags) {
    const tagList = tags.split(',').map(t => t.trim());
    selectedNodes.forEach(node => {
        if (!node.tags) node.tags = [];
        tagList.forEach(tag => {
            if (!node.tags.includes(tag)) node.tags.push(tag);
        });
    });
    updateNodePanel();
    saveState();
    draw();
}

// 47. 노드 태그 일괄 제거
function removeTagsFromSelected(tags) {
    const tagList = tags.split(',').map(t => t.trim());
    selectedNodes.forEach(node => {
        if (node.tags) {
            node.tags = node.tags.filter(t => !tagList.includes(t));
        }
    });
    updateNodePanel();
    saveState();
    draw();
}

// 48. 노드 우선순위 일괄 설정
function setPriorityForSelected(priority) {
    selectedNodes.forEach(node => {
        node.priority = parseInt(priority) || 3;
    });
    updateNodePanel();
    saveState();
    draw();
}

// 49. 노드 진행률 일괄 설정
function setProgressForSelected(progress) {
    selectedNodes.forEach(node => {
        node.progress = parseInt(progress) || 0;
    });
    updateNodePanel();
    saveState();
    draw();
}

// 50. 노드 자동 번호 매기기
function autoNumberNodes() {
    selectedNodes.forEach((node, i) => {
        if (!node.text.match(/^\d+\./)) {
            node.text = `${i + 1}. ${node.text}`;
        }
    });
    updateNodePanel();
    saveState();
    draw();
}


function setupHelpPanel() {
    const closeBtn = document.getElementById("close-help-panel");
    const expandBtn = document.getElementById("help-panel-expand");
    const panel = document.getElementById("help-panel");
    const content = document.getElementById("help-panel-content");
    
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            if (panel) panel.classList.add("hidden");
        });
    }
    
    if (expandBtn && panel) {
        expandBtn.addEventListener("click", () => {
            panel.classList.toggle("expanded");
            expandBtn.textContent = panel.classList.contains("expanded") ? "⊟" : "⛶";
        });
    }
    
    // ? 키 처리는 handleKeyDown에서 처리하므로 여기서는 제거 (중복 방지)
}

// ==================== 초기화 실행 ====================
// DOM이 로드된 후 초기화 (중복 방지)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!isInitialized) init();
    });
} else {
    if (!isInitialized) init();
}
