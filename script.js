function GameBoard() {
	const rows = 3;
	const columns = 3;
	const board = [];

	for (let i = 0; i < rows; i++) {
		board[i] = [];
		for (let j = 0; j < columns; j++) {
			board[i].push(Cell());
		}
	}

	const getBoard = () => board;

	const placeToken = (row, col, player) => {
		const cell = board[row][col];
		if (cell.getValue() === "") {
			cell.addToken(player);
			return true;
		}
		return false; // cell already occupied?
	};

	const printBoard = () => {
		const boardWithCellValues = board.map((row) =>
			row.map((cell) => cell.getValue()),
		);

		console.log(boardWithCellValues);
	};

	return { getBoard, placeToken, printBoard, rows, columns };
}

function Cell() {
	let value = "";

	const addToken = (player) => {
		value = player;
	};

	const getValue = () => value;

	const reset = () => {
		value = "";
	};

	return { addToken, getValue, reset };
}

function Player(name) {
	const getPlayerName = () => name;

	return { getPlayerName };
}

function GameController(
	playerOneName = "Player One",
	playerTwoName = "Player Two",
) {
	const board = GameBoard();

	const players = [
		{
			name: playerOneName,
			token: "X",
		},
		{
			name: playerTwoName,
			token: "O",
		},
	];

	let activePlayer = players[0];

	const switchPlayerTurn = () => {
		activePlayer = activePlayer === players[0] ? players[1] : players[0];
	};

	const getActivePlayer = () => activePlayer;

	const printNewRound = () => {
		board.printBoard();
		console.log(`${getActivePlayer().name}'s turn.`);
	};

	const resetGame = () => {
		const currentBoard = board.getBoard();
		currentBoard.forEach((row) => {
			row.forEach((cell) => {
				cell.reset();
			});
		});

		activePlayer = players[0];
	};

	// checks from 0,0 to 2,2 - upper left to lower right
	const checkFirstDiagonal = () => {
		const updatedBoard = board.getBoard();
		for (let row = 0; row <= board.rows - 3; row++) {
			for (let col = 0; col <= board.columns - 3; col++) {
				if (
					updatedBoard[row][col].getValue() ===
					getActivePlayer().token &&
					updatedBoard[row + 1][col + 1].getValue() ===
					getActivePlayer().token &&
					updatedBoard[row + 2][col + 2].getValue() ===
					getActivePlayer().token
				) {
					return true;
				}
			}
		}
		return false;
	};

	// checks from 0,2 to 2,0 - upper right to lower left
	const checkSecondDiagonal = () => {
		const updatedBoard = board.getBoard();
		for (let row = 0; row <= board.rows - 3; row++) {
			for (let col = 2; col < board.columns; col++) {
				if (
					updatedBoard[row][col].getValue() ===
					getActivePlayer().token &&
					updatedBoard[row + 1][col - 1].getValue() ===
					getActivePlayer().token &&
					updatedBoard[row + 2][col - 2].getValue() ===
					getActivePlayer().token
				) {
					return true;
				}
			}
		}
		return false;
	};

	const checkDiagonal = () => checkFirstDiagonal() || checkSecondDiagonal();

	const checkVertical = () => {
		const updatedBoard = board.getBoard();
		for (let col = 0; col < board.columns; col++) {
			for (let row = 0; row <= board.rows - 3; row++) {
				if (
					updatedBoard[row][col].getValue() ===
					getActivePlayer().token &&
					updatedBoard[row + 1][col].getValue() ===
					getActivePlayer().token &&
					updatedBoard[row + 2][col].getValue() ===
					getActivePlayer().token
				) {
					return true;
				}
			}
		}
		return false;
	};

	const checkHorizontal = () => {
		const updatedBoard = board.getBoard();
		for (let row = 0; row < board.rows; row++) {
			for (let col = 0; col <= board.columns - 3; col++) {
				if (
					updatedBoard[row][col].getValue() ===
					getActivePlayer().token &&
					updatedBoard[row][col + 1].getValue() ===
					getActivePlayer().token &&
					updatedBoard[row][col + 2].getValue() ===
					getActivePlayer().token
				) {
					return true;
				}
			}
		}
		return false;
	};

	const checkTie = () => {
		const currentBoard = board.getBoard();
		return currentBoard.every((row) =>
			row.every((cell) => cell.getValue() !== ""),
		);
	};

	const checkWinner = () => {
		if (checkVertical() || checkHorizontal() || checkDiagonal()) {
			console.log(`The winner is ${getActivePlayer().name}`);
			return true;
		} else {
			console.log(`what you lookin at, keep playing dude -_-`);
			return false;
		}
	};

	// basically playRound returns an object if there is a winner
	const playRound = (row, col) => {
		console.log(
			`Dropping ${getActivePlayer().name}'s token at [${row}, ${col}]`,
		);
		// i think i need to change the column to cell,
		const success = board.placeToken(row, col, getActivePlayer().token);
		if (!success) {
			console.log("cell already occupied");
			return false;
		}

		const winnerFound = checkWinner();
		if (winnerFound) {
			return getActivePlayer();
		}

		if (checkTie()) return "TIE";

		switchPlayerTurn();
		printNewRound();
		return false;
	};

	printNewRound();

	return {
		playRound,
		getActivePlayer,
		checkWinner,
		resetGame,
		getBoard: board.getBoard,
	};
}

function GameIntro() {
	// handler for submitting player names
	function startGameHandler(e) {
		e.preventDefault();

		// get inputs
		const playerOneInput = document.getElementById("playerone");
		const playerTwoInput = document.getElementById("playertwo");

		// read values
		const p1Name = playerOneInput.value;
		const p2Name = playerTwoInput.value;

		const introDiv = document.querySelector(".intro");
		introDiv.style.display = "none";

		const game = GameController(p1Name, p2Name);
		ScreenController(game);
	}

	const startGameBtn = document.querySelector("#start-game");
	startGameBtn.addEventListener("click", startGameHandler);
}

function ScreenController(game) {
	const playerTurnDiv = document.querySelector(".turn");
	const boardDiv = document.querySelector(".board");
	const messageDiv = document.querySelector(".message");
	const playAgainBtn = document.querySelector("#play-again-btn");

	const updateScreen = () => {
		// clear the board
		boardDiv.textContent = "";

		// get updated board and player turn
		const board = game.getBoard();
		const activePlayer = game.getActivePlayer();

		// display player's turn
		playerTurnDiv.textContent = `${activePlayer.name}'s turn...`;

		board.forEach((row, rowIndex) => {
			row.forEach((cell, colIndex) => {
				const cellButton = document.createElement("button");
				cellButton.classList.add("cell");
				cellButton.dataset.row = rowIndex;
				cellButton.dataset.col = colIndex;
				cellButton.textContent = cell.getValue();
				boardDiv.appendChild(cellButton);
			});
		});
	};

	// e would be cell, and it should be passed in playRound
	function clickHandlerBoard(e) {
		const button = e.target;
		// row and col will be passed insted to placeToken
		const row = parseInt(button.dataset.row);
		const col = parseInt(button.dataset.col);
		console.log(row, col);

		if (isNaN(row) || isNaN(col)) return;

		// so i pass row, col to playRound, which will then be used by placeToken
		const winner = game.playRound(row, col);
		// despite playRound returns "TIE", i just check if there is a winner variable, which it is, thats why it prints win, even it should be tie
		if (winner !== "TIE" && winner.name) {
			updateScreen();
			messageDiv.textContent = `${winner.name} wins!`;
			boardDiv.before(messageDiv);
			playAgainBtn.style.display = "block";
		} else if (winner === "TIE") {
			playerTurnDiv.style.display = "none";
			messageDiv.textContent = `its a tie`;
			boardDiv.before(messageDiv);
			playAgainBtn.style.display = "block";
			updateScreen();
		} else {
			updateScreen();
		}
	}

	function playNewGame() {
		game.resetGame();
		updateScreen();
		messageDiv.remove();
		playAgainBtn.style.display = "none";
	}

	boardDiv.addEventListener("click", clickHandlerBoard);
	playAgainBtn.addEventListener("click", playNewGame);

	// initial board render
	updateScreen();
}

GameIntro();
