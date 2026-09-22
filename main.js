import { playhtml } from "https://unpkg.com/playhtml";

const SIZE = 9;
const NETWORK_ROOM_ID = "ottv2-network";
const LOBBY_CHANNEL_NAME = "ottv2-lobby";
const PRESENCE_INTERVAL = 4000;
const PRESENCE_TIMEOUT = 12000;

const boardEl = document.getElementById("board");
const turnEl = document.getElementById("turn");
const statusEl = document.getElementById("status");
const roomLinkEl = document.getElementById("room-link");
const roomCodeInputEl = document.getElementById("room-code-input");
const joinRoomBtn = document.getElementById("join-room");
const randomRoomBtn = document.getElementById("random-room");
const createRoomBtn = document.getElementById("create-room");
const roomChoiceEl = document.getElementById("room-choice");
const roomChoiceStatusEl = document.getElementById("room-choice-status");
const resetGameBtn = document.getElementById("reset-game");
const roomStateEl = document.getElementById("room-state");
const playerTeamEl = document.getElementById("player-team");

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
let lobbyChannel = null;
let roomCode = "";
let playerId = "";
let playerTeam = null;
let isRoomFull = false;
let isApplyingRemoteState = false;
let presenceTimer = null;
let isLeavingRoom = false;
let isNewRoom = false;
let roomJoinError = "";

function getPlayerId() {
    const storageKey = "ottv2-player-id";
    let id = sessionStorage.getItem(storageKey);

    if (!id) {
        id = crypto.randomUUID?.() ||
            `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        sessionStorage.setItem(storageKey, id);
    }

    return id;
}

function makeRoomCode() {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    return Array.from({ length: 6 }, () =>
        alphabet[Math.floor(Math.random() * alphabet.length)]
    ).join("");
}

function getRoomFromUrl() {
    return new URL(window.location.href).searchParams.get("room")?.toUpperCase() || "";
}

function updateRoomUrl(code) {
    const url = new URL(window.location.href);
    url.searchParams.set("room", code);
    window.history.replaceState({}, "", url);
    roomLinkEl.href = url.href;
    roomLinkEl.textContent = url.href;
    roomCodeInputEl.value = code;
}

function getLobbyState() {
    const storedState = lobbyChannel.getData();
    const state = storedState && typeof storedState === "object" && storedState.rooms
        ? storedState
        : { rooms: {} };
    let changed = false;

    Object.entries(state.rooms).forEach(([code, storedRoom]) => {
        const room = normalizeRoom(storedRoom);

        if (room.players.length === 0) {
            delete state.rooms[code];
            changed = true;
        } else if (room.players.length !== storedRoom.players.length) {
            state.rooms[code] = room;
            changed = true;
        }
    });

    if (changed) lobbyChannel.setData(state);
    return state;
}

function saveLobbyState(state) {
    lobbyChannel.setData(state);
}

function normalizeRoom(room) {
    if (!room || !Array.isArray(room.players)) {
        return { players: [], lastSeen: {} };
    }

    const now = Date.now();
    const players = room.players
        .map((player) => typeof player === "string" ? player : player.id)
        .filter(Boolean);
    const lastSeen = { ...(room.lastSeen || {}) };

    players.forEach((id) => {
        if (!lastSeen[id]) lastSeen[id] = now;
    });

    return {
        players: players.filter((id) => now - lastSeen[id] <= PRESENCE_TIMEOUT),
        lastSeen
    };
}

function resetSharedGameState() {
    if (!sharedStateChannel) return;

    sharedStateChannel.setData({
        board: buildInitialBoard(),
        currentTeam: "red",
        isGameOver: false
    });
}

function leaveRoom() {
    if (isLeavingRoom || !lobbyChannel || !roomCode || !playerId) return;

    isLeavingRoom = true;
    if (presenceTimer) clearInterval(presenceTimer);

    const lobbyState = getLobbyState();
    const room = normalizeRoom(lobbyState.rooms[roomCode]);
    room.players = room.players.filter((id) => id !== playerId);
    delete room.lastSeen[playerId];

    if (room.players.length === 0) {
        delete lobbyState.rooms[roomCode];
    } else {
        lobbyState.rooms[roomCode] = room;
        resetSharedGameState();
    }

    saveLobbyState(lobbyState);
}

function refreshPresence() {
    if (isLeavingRoom || !lobbyChannel || !roomCode || !playerId) return;

    const lobbyState = getLobbyState();
    const room = normalizeRoom(lobbyState.rooms[roomCode]);

    if (!room.players.includes(playerId)) return;

    room.lastSeen[playerId] = Date.now();
    lobbyState.rooms[roomCode] = room;
    saveLobbyState(lobbyState);
}

function startPresenceHeartbeat() {
    refreshPresence();
    presenceTimer = setInterval(refreshPresence, PRESENCE_INTERVAL);
    window.addEventListener("pagehide", leaveRoom, { once: true });
}

function claimRoom(requestedCode, mode) {
    const lobbyState = getLobbyState();
    let selectedCode = requestedCode;
    let room = null;
    isNewRoom = false;
    roomJoinError = "";

    if (mode === "create") {
        do {
            selectedCode = makeRoomCode();
        } while (lobbyState.rooms[selectedCode]);
        room = { players: [], lastSeen: {} };
        isNewRoom = true;
    } else if (mode === "random") {
        const waitingRoom = Object.entries(lobbyState.rooms)
            .map(([code, candidate]) => [code, normalizeRoom(candidate)])
            .find(([, candidate]) => candidate.players.length === 1);

        if (waitingRoom) {
            [selectedCode, room] = waitingRoom;
        } else {
            do {
                selectedCode = makeRoomCode();
            } while (lobbyState.rooms[selectedCode]);
            room = { players: [], lastSeen: {} };
            isNewRoom = true;
        }
    } else {
        if (!selectedCode || !lobbyState.rooms[selectedCode]) {
            roomJoinError = "Mã phòng không tồn tại.";
            return false;
        }

        room = normalizeRoom(lobbyState.rooms[selectedCode]);
    }

    if (mode === "code" && room.players.length === 0) {
        roomJoinError = "Phòng chưa có người chờ, không thể vào bằng mã này.";
        return false;
    }

    if (room && room.players.includes(playerId)) {
        playerTeam = room.players[0] === playerId ? "red" : "blue";
    } else if (room && room.players.length >= 2) {
        roomJoinError = "Phòng đã đủ 2 người, không thể vào.";
        return false;
    }

    if (room.players.length === 0) {
        isNewRoom = true;
    }

    if (!room.players.includes(playerId)) {
        room.players.push(playerId);
        playerTeam = room.players.length === 1 ? "red" : "blue";
        room.lastSeen[playerId] = Date.now();
    }

    lobbyState.rooms[selectedCode] = {
        players: room.players.slice(0, 2),
        lastSeen: room.lastSeen
    };
    saveLobbyState(lobbyState);

    roomCode = selectedCode;
    isRoomFull = lobbyState.rooms[selectedCode].players.length === 2;
    updateRoomUrl(roomCode);
    return true;
}

function showRoomChoiceError() {
    roomChoiceStatusEl.textContent = roomJoinError || "Không thể vào phòng này.";
}

function hideRoomChoice() {
    roomChoiceEl.hidden = true;
}

function setupRoom() {
    document.body.classList.add("in-room");

    sharedStateChannel = playhtml.createPageData(
        `ottv2-game-state-${roomCode}`,
        {
            board: buildInitialBoard(),
            currentTeam: "red",
            isGameOver: false,
            resetVotes: []
        }
    );

    sharedStateChannel.onUpdate((state) => {
        restoreSharedState(state);
    });

    lobbyChannel.onUpdate((state) => {
        const room = state?.rooms?.[roomCode];
        if (!room || !room.players.includes(playerId)) return;
        isRoomFull = room.players.length === 2;
        renderRoomStatus();
    });

    const currentSharedState = sharedStateChannel.getData();

    if (currentSharedState && !isNewRoom) {
        restoreSharedState(currentSharedState);
    } else {
        publishSharedState();
    }

    startPresenceHeartbeat();
    renderRoomStatus();
    hideRoomChoice();
}

function renderRoomStatus() {
    const teamName = TEAM_NAMES[playerTeam];
    playerTeamEl.textContent = `Bạn là quân ${teamName}`;
    playerTeamEl.className = `player-team ${playerTeam}`;

    if (isRoomFull) {
        roomStateEl.textContent = `Phòng ${roomCode} đã đủ 2 người.`;
    } else {
        roomStateEl.textContent = `Phòng ${roomCode} đang chờ người chơi thứ 2.`;
    }
}

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
    resetGameBtn.textContent = "Chơi lại từ đầu";
    setStatus("Đã chơi lại từ đầu. Phe Đỏ đang đi.");
    publishSharedState();
}

function requestGameReset() {
    if (!isRoomFull || !playerTeam || !sharedStateChannel) {
        setStatus("Chưa đủ 2 người chơi để bắt đầu lại.");
        return;
    }

    const sharedState = sharedStateChannel.getData() || getSharedState();
    const resetVotes = Array.isArray(sharedState.resetVotes)
        ? sharedState.resetVotes.filter(Boolean)
        : [];

    if (!resetVotes.includes(playerId)) {
        resetVotes.push(playerId);
    }

    if (resetVotes.length >= 2) {
        isApplyingRemoteState = false;
        resetGameState();
        return;
    }

    sharedStateChannel.setData({
        ...sharedState,
        resetVotes
    });
    resetGameBtn.textContent = "Đã đồng ý - chờ người kia";
    setStatus("Bạn đã đồng ý chơi lại. Đang chờ người chơi còn lại.");
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
        isGameOver,
        resetVotes: []
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

    const resetVotes = Array.isArray(sharedState.resetVotes)
        ? sharedState.resetVotes
        : [];

    if (resetVotes.length >= 2) {
        resetGameState();
        return;
    }

    renderBoard();

    isApplyingRemoteState = false;

    if (isGameOver) {
        setStatus("Ván đấu đã kết thúc trên thiết bị khác.");
    } else if (resetVotes.includes(playerId)) {
        resetGameBtn.textContent = "Đã đồng ý - chờ người kia";
        setStatus("Người chơi còn lại chưa đồng ý chơi lại.");
    } else if (resetVotes.length === 1) {
        resetGameBtn.textContent = "Đồng ý chơi lại";
        setStatus("Người chơi còn lại muốn chơi lại từ đầu.");
    } else {
        resetGameBtn.textContent = "Chơi lại từ đầu";
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

    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            const cell = document.getElementById(`cell-${r}-${c}`);

            if (r === 8 && c === 0) {
                cell.classList.add("goal-red");
                cell.title = "Ô đích a1 của phe Đỏ";
            } else if (r === 0 && c === 8) {
                cell.classList.add("goal-blue");
                cell.title = "Ô đích i9 của phe Xanh";
            } else {
                cell.classList.remove("goal-red", "goal-blue");
                cell.removeAttribute("title");
            }
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

    const redGoal = boardState[8][0];
    const blueGoal = boardState[0][8];

    if (redGoal && redGoal.team === "red") {
        isGameOver = true;
        setStatus("Phe Đỏ thắng vì đưa quân vào ô a1!");
        return;
    }

    if (blueGoal && blueGoal.team === "blue") {
        isGameOver = true;
        setStatus("Phe Xanh thắng vì đưa quân vào ô i9!");
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
    if (isGameOver) {
        setStatus("Ván đấu đã kết thúc.");
        return;
    }

    if (!isRoomFull) {
        setStatus("Đang chờ người chơi thứ 2 vào phòng.");
        return;
    }

    if (playerTeam !== currentTeam) {
        setStatus(`Đang chờ phe ${TEAM_NAMES[currentTeam]} đi.`);
        return;
    }

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

    // Kiểm tra thắng trước khi đồng bộ để thiết bị còn lại
    // nhận cả isGameOver.
    checkWin();

    renderBoard();
    publishSharedState();

    if (!isGameOver) {
        setStatus(`${TEAM_NAMES[currentTeam]} đang đi.`);
    }
}

async function initGame() {
    boardState = buildInitialBoard();
    boardEl.innerHTML = "";

    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            boardEl.appendChild(createCell(r, c));
        }
    }

    renderBoard();
    setStatus("Đang kết nối sảnh phòng chơi...");

    resetGameBtn.addEventListener("click", () => {
        requestGameReset();
    });

    await playhtml.init({ room: NETWORK_ROOM_ID });
    await playhtml.ready;

    playerId = getPlayerId();
    lobbyChannel = playhtml.createPageData(LOBBY_CHANNEL_NAME, { rooms: {} });

    const requestedCode = getRoomFromUrl();
    if (requestedCode) {
        roomCodeInputEl.value = requestedCode;
    }

    randomRoomBtn.addEventListener("click", () => {
        if (claimRoom("", "random")) {
            setupRoom();
        } else {
            showRoomChoiceError();
        }
    });

    createRoomBtn.addEventListener("click", () => {
        if (claimRoom("", "create")) {
            setupRoom();
        } else {
            showRoomChoiceError();
        }
    });

    joinRoomBtn.addEventListener("click", () => {
        const code = roomCodeInputEl.value.trim().toUpperCase();

        if (!/^[A-Z0-9]{6}$/.test(code)) {
            roomChoiceStatusEl.textContent = "Mã phòng phải gồm đúng 6 ký tự.";
            return;
        }

        if (claimRoom(code, "code")) {
            setupRoom();
        } else {
            showRoomChoiceError();
        }
    });
}

initGame().catch((error) => {
    console.error(error);
    setStatus("Không thể kết nối phòng chơi. Hãy kiểm tra Internet và tải lại trang.");
});
