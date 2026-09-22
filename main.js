import { playhtml } from "https://unpkg.com/playhtml";

const SIZE = 9;
const STATE_CHANNEL_NAME = "ottv2-game-state";

// --- LOGIC QUẢN LÝ MÃ PHÒNG (ROOM ID) ---
function getRoomIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("room")?.trim();
}

function generateRandomRoomId() {
    // Tạo mã ngẫu nhiên 6 ký tự chữ/số (Ví dụ: K9A2X1)
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Lấy mã phòng từ URL, nếu không có thì tạo mới và tự cập nhật URL
let currentRoomCode = getRoomIdFromURL();
if (!currentRoomCode) {
    currentRoomCode = generateRandomRoomId();
    const newUrl = `${window.location.pathname}?room=${currentRoomCode}`;
    window.history.replaceState(null, "", newUrl);
}

// Đặt prefix để tránh trùng tên room với ứng dụng khác trên PlayHTML
const ROOM_ID = `ottv2-room-${currentRoomCode}`;

// Element UI
const boardEl = document.getElementById("board");
const turnEl = document.getElementById("turn");
const statusEl = document.getElementById("status");
const resetGameBtn = document.getElementById("reset-game");
const currentRoomDisplayEl = document.getElementById("current-room-display");
const copyLinkBtn = document.getElementById("copy-link-btn");
const roomInput = document.getElementById("room-input");
const joinRoomBtn = document.getElementById("join-room-btn");
const createRoomBtn = document.getElementById("create-room-btn");

const PIECE_ICONS = {
    rock: "✊",
    paper: "✋",
    scissors: "✌️"
};

const PIECE_BEATS = {
    rock: "scissors",
    paper: "rock",
    scissors: "paper"
};

const TEAM_NAMES = {
    red: "Đỏ",
    blue: "Xanh"
};

const STARTING_POSITIONS = [
    ["rock", "red", 7, 0],
    ["paper", "red", 7, 1],
    ["scissors", "red", 7, 2],
    ["rock", "red", 7, 3],
    ["paper", "red", 7, 4],
    ["scissors", "red", 7, 5],
    ["rock", "red", 7, 6],
    ["paper", "red", 7, 7],
    ["scissors", "red", 7, 8],
    ["scissors", "blue", 1, 0],
    ["rock", "blue", 1, 1],
    ["paper", "blue", 1, 2],
    ["scissors", "blue", 1, 3],
    ["rock", "blue", 1, 4],
    ["paper", "blue", 1, 5],
    ["scissors", "blue", 1, 6],
    ["rock", "blue", 1, 7],
    ["paper", "blue", 1, 8]
];

let selected = null;
let currentTeam = "red";
let isGameOver = false;
let boardState = [];
let sharedStateChannel = null;
let isApplyingRemoteState = false;

function setStatus(message) {
    statusEl.textContent = message;
}

function renderTurn() {
    turnEl.textContent = `${TEAM_NAMES[currentTeam]} đang đi`;
}

function resetGameState() {
    selected = null;
    currentTeam = "red";
    isGameOver = false;
    boardState = buildInitialBoard();
    renderBoard();
    setStatus("Đã chơi lại từ đầu. Phe Đỏ đang đi.");
    publishSharedState();
}

function makeEmptyBoard() {
    return Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
}

function buildInitialBoard() {
    const board = makeEmptyBoard();

    STARTING_POSITIONS.forEach(([piece, team, r, c]) => {
        board[r][c] = { piece, team };
    });

    return board;
}

function getSharedState() {
    return {
        board: boardState,
        currentTeam,
        isGameOver
    };
}

function publishSharedState() {
    if (!sharedStateChannel || isApplyingRemoteState) return;
    sharedStateChannel.setData(getSharedState());
}

function restoreSharedState(sharedState) {
    if (!sharedState) return;

    if (typeof sharedState === "string") {
        try {
            sharedState = JSON.parse(sharedState);
        } catch {
            return;
        }
    }

    if (!Array.isArray(sharedState.board) || sharedState.board.length !== SIZE) {
        return;
    }

    if (!["red", "blue"].includes(sharedState.currentTeam)) {
        return;
    }

    const hasValidRows = sharedState.board.every(
        (row) => Array.isArray(row) && row.length === SIZE
    );

    if (!hasValidRows) return;

    isApplyingRemoteState = true;

    selected = null;
    boardState = sharedState.board;
    currentTeam = sharedState.currentTeam;
    isGameOver = Boolean(sharedState.isGameOver);

    renderBoard();

    isApplyingRemoteState = false;

    if (isGameOver) {
        setStatus("Ván đấu đã kết thúc trên thiết bị khác.");
    } else {
        setStatus(`${TEAM_NAMES[currentTeam]} đang đi.`);
    }
}

function createCell(r, c) {
    const cell = document.createElement("div");

    cell.className = "cell";
    cell.id = `cell-${r}-${c}`;
    cell.dataset.r = String(r);
    cell.dataset.c = String(c);

    cell.addEventListener("click", () => handleMove(cell));

    return cell;
}

function renderBoard() {
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            const cell =
                document.getElementById(`cell-${r}-${c}`) ||
                createCell(r, c);

            const piece = boardState[r][c];

            cell.classList.remove("selected");

            if (piece) {
                cell.dataset.piece = piece.piece;
                cell.dataset.team = piece.team;
                cell.innerHTML =
                    `<span class="piece ${piece.team}">${PIECE_ICONS[piece.piece]}</span>`;
            } else {
                delete cell.dataset.piece;
                delete cell.dataset.team;
                cell.innerHTML = "";
            }

            if (!cell.isConnected) {
                boardEl.appendChild(cell);
            }
        }
    }

    if (selected) {
        const selectedCell = document.getElementById(
            `cell-${selected.dataset.r}-${selected.dataset.c}`
        );

        if (selectedCell) {
            selectedCell.classList.add("selected");
        }
    }

    renderTurn();
}

function countPieces(team) {
    const counts = { rock: 0, paper: 0, scissors: 0 };

    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            const piece = boardState[r][c];

            if (piece && piece.team === team) {
                counts[piece.piece] += 1;
            }
        }
    }

    return counts;
}

function checkWin() {
    if (isGameOver) return;

    const redGoal = boardState[0][8];
    const blueGoal = boardState[8][0];

    if (redGoal && redGoal.team === "red") {
        isGameOver = true;
        setStatus("Phe Đỏ thắng vì đưa quân vào ô i9!");
        return;
    }

    if (blueGoal && blueGoal.team === "blue") {
        isGameOver = true;
        setStatus("Phe Xanh thắng vì đưa quân vào ô a1!");
        return;
    }

    const redCounts = countPieces("red");
    const blueCounts = countPieces("blue");

    if (
        Object.values(redCounts).includes(0) &&
        Object.values(blueCounts).some((count) => count > 0)
    ) {
        isGameOver = true;
        setStatus("Phe Xanh thắng vì phe Đỏ đã hết một loại quân!");
        return;
    }

    if (
        Object.values(blueCounts).includes(0) &&
        Object.values(redCounts).some((count) => count > 0)
    ) {
        isGameOver = true;
        setStatus("Phe Đỏ thắng vì phe Xanh đã hết một loại quân!");
    }
}

function canMoveTo(targetCell, sourceCell) {
    if (!targetCell || !sourceCell) return false;

    const r1 = Number(sourceCell.dataset.r);
    const c1 = Number(sourceCell.dataset.c);
    const r2 = Number(targetCell.dataset.r);
    const c2 = Number(targetCell.dataset.c);

    const isAdjacent =
        Math.abs(r1 - r2) <= 1 &&
        Math.abs(c1 - c2) <= 1;

    if (!isAdjacent) return false;

    const sourcePiece = boardState[r1][c1];
    const targetPiece = boardState[r2][c2];

    if (!sourcePiece) return false;
    if (targetPiece && targetPiece.team === sourcePiece.team) return false;
    if (!targetPiece) return true;
    if (targetPiece.piece === sourcePiece.piece) return false;

    return (
        PIECE_BEATS[sourcePiece.piece] === targetPiece.piece ||
        PIECE_BEATS[targetPiece.piece] === sourcePiece.piece
    );
}

function makeMove(fromR, fromC, toR, toC) {
    const fromPiece = boardState[fromR][fromC];
    const targetPiece = boardState[toR][toC];

    if (!fromPiece) return false;

    if (!targetPiece) {
        boardState[toR][toC] = { ...fromPiece };
        boardState[fromR][fromC] = null;
        return true;
    }

    if (targetPiece.team === fromPiece.team) return false;

    if (PIECE_BEATS[fromPiece.piece] === targetPiece.piece) {
        boardState[toR][toC] = { ...fromPiece };
        boardState[fromR][fromC] = null;
        return true;
    }

    if (PIECE_BEATS[targetPiece.piece] === fromPiece.piece) {
        boardState[fromR][fromC] = null;
        return true;
    }

    return false;
}

function handleMove(targetCell) {
    if (isGameOver) return;

    const r = Number(targetCell.dataset.r);
    const c = Number(targetCell.dataset.c);
    const clickedPiece = boardState[r][c];

    if (!selected && clickedPiece && clickedPiece.team === currentTeam) {
        selected = targetCell;
        selected.classList.add("selected");
        setStatus(`Đã chọn quân ${TEAM_NAMES[currentTeam]}.`);
        return;
    }

    if (!selected) {
        setStatus("Hãy chọn một quân của phe đang đi.");
        return;
    }

    const fromR = Number(selected.dataset.r);
    const fromC = Number(selected.dataset.c);

    if (r === fromR && c === fromC) {
        selected.classList.remove("selected");
        selected = null;
        return;
    }

    if (!canMoveTo(targetCell, selected)) {
        selected.classList.remove("selected");
        selected = null;
        setStatus("Nước đi không hợp lệ. Chỉ được di chuyển 1 ô theo 8 hướng.");
        return;
    }

    const moved = makeMove(fromR, fromC, r, c);

    if (!moved) {
        setStatus("Không thể thực hiện nước đi này.");
        selected.classList.remove("selected");
        selected = null;
        return;
    }

    selected = null;

    currentTeam = currentTeam === "red" ? "blue" : "red";

    checkWin();

    renderBoard();
    publishSharedState();

    if (!isGameOver) {
        setStatus(`${TEAM_NAMES[currentTeam]} đang đi.`);
    }
}

// --- KHỞI TẠO XỬ LÝ SỰ KIỆN QUẢN LÝ PHÒNG ---
function setupRoomEvents() {
    currentRoomDisplayEl.textContent = currentRoomCode;

    // Nút Sao chép đường dẫn phòng
    copyLinkBtn.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            const originalText = copyLinkBtn.textContent;
            copyLinkBtn.textContent = "✅ Đã sao chép!";
            setTimeout(() => {
                copyLinkBtn.textContent = originalText;
            }, 2000);
        } catch {
            alert("Không thể tự động sao chép. Bạn có thể copy link trên thanh địa chỉ!");
        }
    });

    // Nút Vào phòng theo mã
    joinRoomBtn.addEventListener("click", () => {
        const targetRoom = roomInput.value.trim();
        if (targetRoom) {
            window.location.search = `?room=${encodeURIComponent(targetRoom)}`;
        } else {
            alert("Vui lòng nhập mã phòng!");
        }
    });

    // Nút Tạo phòng ngẫu nhiên mới
    createRoomBtn.addEventListener("click", () => {
        const newCode = generateRandomRoomId();
        window.location.search = `?room=${newCode}`;
    });
}

async function initGame() {
    setupRoomEvents();

    boardState = buildInitialBoard();
    boardEl.innerHTML = "";

    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            boardEl.appendChild(createCell(r, c));
        }
    }

    renderBoard();
    setStatus(`Đang kết nối vào phòng [${currentRoomCode}]...`);

    resetGameBtn.addEventListener("click", () => {
        resetGameState();
    });

    // Kết nối đến PlayHTML với ROOM_ID tương ứng theo mã phòng
    await playhtml.init({ room: ROOM_ID });
    await playhtml.ready;

    const initialState = {
        board: buildInitialBoard(),
        currentTeam: "red",
        isGameOver: false
    };

    sharedStateChannel = playhtml.createPageData(
        STATE_CHANNEL_NAME,
        initialState
    );

    sharedStateChannel.onUpdate((state) => {
        restoreSharedState(state);
    });

    restoreSharedState(sharedStateChannel.getData());

    setStatus(`${TEAM_NAMES[currentTeam]} đang đi.`);
}

initGame().catch((error) => {
    console.error(error);
    setStatus("Không thể kết nối phòng chơi. Hãy kiểm tra Internet và tải lại trang.");
});