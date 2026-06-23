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
		// reset every cell in the board
		currentBoard.forEach((row) => {
			row.forEach((cell) => {
				cell.reset();
			});
		});

		// resets the activePlayer
		activePlayer = players[0];
	};

	// const checkDiagonal = () => { };

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
			// am not sure what board.columns - 3 does
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
		// okay, i need to iterate over the board and check if there is a value of either players
		const currentBoard = board.getBoard();
		return currentBoard.every((row) =>
			row.every((cell) => cell.getValue() !== 0),
		);
	};

	const checkWinner = () => {
		if (checkVertical() || checkHorizontal()) {
			console.log(`The winner is ${getActivePlayer().name}`);
			return true;
		} else {
			console.log(`what you lookin at, keep playing dude -_-`);
			return false;
		}
	};

	const playRound = (column) => {
		console.log(
			`Dropping ${getActivePlayer().name}'s token into column ${column}...`,
		);
		board.dropToken(column, getActivePlayer().token);

		// add check winner, handle logic such as win message
		const winnerFound = checkWinner();
		if (winnerFound) {
			return getActivePlayer();
		} else if (checkTie()) {
			console.log("its a tie");
			return false;
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

		// render board
		board.forEach((row) => {
			row.forEach((cell, index) => {
				// anything clickable should be a button
				const cellButton = document.createElement("button");
				cellButton.classList.add("cell");

				// create a data attribute to identify the column
				// this makes it easier to pass into playRound()
				cellButton.dataset.column = index;
				cellButton.textContent = cell.getValue();
				boardDiv.appendChild(cellButton);
			});
		});
	};

	function clickHandlerBoard(e) {
		const selectedColumn = e.target.dataset.column;

		if (!selectedColumn) return;

		const winner = game.playRound(selectedColumn);
		if (winner) {
			updateScreen();
			messageDiv.textContent = `${winner.name} wins!`;
			boardDiv.before(messageDiv);

			// if winner is found, play again button is displayed
			playAgainBtn.style.display = "block";
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
