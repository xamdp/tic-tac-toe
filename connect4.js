function Gameboard() {
	const rows = 6;
	const columns = 7;
	const board = [];

	// the board is created using rows first then columns, so when accessing board values, board[row][col] ...
	for (let i = 0; i < rows; i++) {
		board[i] = [];
		for (let j = 0; j < columns; j++) {
			board[i].push(Cell());
		}
	}

	const getBoard = () => board;

	const dropToken = (column, player) => {
		const availableCells = board
			.filter((row) => row[column].getValue() === 0)
			.map((row) => row[column]);

		if (!availableCells.length) return;

		const lowestRow = availableCells.length - 1;
		board[lowestRow][column].addToken(player);
	};

	const printBoard = () => {
		const boardWithCellValues = board.map((row) =>
			row.map((cell) => cell.getValue()),
		);
		console.log(boardWithCellValues);
	};

	return { getBoard, dropToken, printBoard, rows, columns };
}

function Cell() {
	let value = 0;

	const addToken = (player) => {
		value = player;
	};

	const getValue = () => value;

	const reset = () => {
		value = 0;
	};

	return { addToken, getValue, reset };
}

function Player(name) {
	const getPlayerName = () => name;

	return {
		getPlayerName,
	};
}

function GameController(
	playerOneName = "Player One",
	playerTwoName = "Player Two",
) {
	const board = Gameboard();

	const players = [
		{
			name: playerOneName,
			token: 1,
		},
		{
			name: playerTwoName,
			token: 2,
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
		// resets every cell in the board
		currentBoard.forEach((row) => {
			row.forEach((cell) => {
				cell.reset();
			});
		});
		// resets the activePlayer
		activePlayer = players[0];
	};

	// so to access the board values, i should access it the way how the board was created
	const checkVertical = () => {
		const updatedBoard = board.getBoard();
		for (let col = 0; col < board.columns; col++) {
			for (let row = 0; row <= board.rows - 4; row++) {
				if (
					updatedBoard[row][col].getValue() ===
					getActivePlayer().token &&
					updatedBoard[row + 1][col].getValue() ===
					getActivePlayer().token &&
					updatedBoard[row + 2][col].getValue() ===
					getActivePlayer().token &&
					updatedBoard[row + 3][col].getValue() ===
					getActivePlayer().token
				) {
					return true;
				}
			}
		}
		return false;
	};

	// so to access the board values, i should access it the way how the board was created
	const checkHorizontal = () => {
		const updatedBoard = board.getBoard();
		for (let row = 0; row < board.rows; row++) {
			for (let col = 0; col <= board.columns - 4; col++) {
				if (
					updatedBoard[row][col].getValue() ===
					getActivePlayer().token &&
					updatedBoard[row][col + 1].getValue() ===
					getActivePlayer().token &&
					updatedBoard[row][col + 2].getValue() ===
					getActivePlayer().token &&
					updatedBoard[row][col + 3].getValue() ===
					getActivePlayer().token
				) {
					return true;
				}
			}
		}
		return false;
	};

	const checkWinner = () => {
		if (checkVertical() || checkHorizontal()) {
			console.log(`The winner is ${getActivePlayer().name}`);
			return true;
		} else {
			console.log(`what you lookin at, keep playing.`);
			return false;
		}
	};

	const playRound = (column) => {
		console.log(
			`Dropping ${getActivePlayer().name}'s token into column ${column}...`,
		);
		board.dropToken(column, getActivePlayer().token);

		// check for a winner here and handle that logic, such as a win message.
		const winnerFound = checkWinner();
		if (winnerFound) {
			return getActivePlayer();
		}
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

function ScreenController() {
	const game = GameController();
	// const board = Gameboard();
	const playerTurnDiv = document.querySelector(".turn");
	const boardDiv = document.querySelector(".board");
	const messageDiv = document.querySelector(".message");

	// it must show first the intro screen before the created board game.
	// const showIntro = () => { };

	const updateScreen = () => {
		// clear the board
		boardDiv.textContent = "";

		// get the newest version of the board and player turn
		const board = game.getBoard();
		const activePlayer = game.getActivePlayer();

		// Display player's turn
		playerTurnDiv.textContent = `${activePlayer.name}'s  turn...`;

		// Render board squares
		board.forEach((row) => {
			row.forEach((cell, index) => {
				// Anything clickable should be a button!
				const cellButton = document.createElement("button");
				cellButton.classList.add("cell");

				// create a data attribute to identify the column
				// This makes it easier to pass into our `playRound` function
				cellButton.dataset.column = index;
				cellButton.textContent = cell.getValue();
				boardDiv.appendChild(cellButton);
			});
		});
	};

	// add event listener for the board
	function clickHandlerBoard(e) {
		const selectedColumn = e.target.dataset.column;
		// make sure i've clicked a column and not the gaps in between
		if (!selectedColumn) return;

		const winner = game.playRound(selectedColumn);
		if (winner) {
			// temporary updates the screen when winner is found.
			updateScreen();
			messageDiv.textContent = `${winner.name} wins!`;
			boardDiv.before(messageDiv);

			setTimeout(() => {
				game.resetGame();
				updateScreen();
				messageDiv.remove();
			}, 1500);
		} else {
			updateScreen();
		}
	}
	boardDiv.addEventListener("click", clickHandlerBoard);

	// initial render
	updateScreen();
}

ScreenController();

window.addEventListener("load", () => {
	const intro = document.querySelector(".intro");
	intro.style.opacity = 0;
	// should only remove the intro after player names input
	setTimeout(() => intro.remove(), 500);
});
