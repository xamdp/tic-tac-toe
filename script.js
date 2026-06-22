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

	return { getBoard, dropToken, printBoard };
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

	const playRound = (column) => {
		console.log(
			`Dropping ${getActivePlayer().name}'s token into column ${column}...`,
		);
		board.dropToken(column, getActivePlayer().token);

		// add check winner, handle logic such as win message

		switchPlayerTurn();
		printNewRound();
	};

	printNewRound();

	return {
		playRound,
		getActivePlayer,
		getBoard: board.getBoard,
	};
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

	updateScreen();
}

const startGame = GameController();
ScreenController(startGame);
