/* A Cell represents one "square" on the board and can have one of
** '-': no token is in the square,
** o: Player One's token,
** x: Player 2's token
*/
function Cell() {
  let value = '-';

  // Accept a player's token to change the value of the cell
  const addToken = (player) => {
    value = player;
  };

  // How we will retrieve the current value of this cell through closure
  const getValue = () => value;

  return {
    addToken,
    getValue,
  };
}

function Gameboard() {
  const rows = 3;
  const columns = 3;
  const board = [];

  // Create a 2d array that will represent the state of the game board
  // For this 2d array, row 0 will represent the top row and
  // column 0 will represent the left-most column.
  for (let i = 0; i < rows; i += 1) {
    board[i] = [];
    for (let j = 0; j < columns; j += 1) {
      board[i].push(Cell());
    }
  }

  // This will be the method of getting the entire board that our
  // UI will eventually need to render it.
  const getBoard = () => board;

  const placeMark = (position, player) => {
    // turn position into row, column.
    let row;
    let column;

    if (position === '0' || position === '1' || position === '2') {
      row = 0;
    } else if (position === '3' || position === '4' || position === '5') {
      row = 1;
    } else {
      row = 2;
    }

    if (position === '0' || position === '3' || position === '6') {
      column = 0;
    } else if (position === '1' || position === '4' || position === '7') {
      column = 1;
    } else {
      column = 2;
    }

    // Replace value in board[row][column] with player token
    // only if the token is a '-'.
    if (board[row][column].getValue() === '-') {
      board[row][column].addToken(player);
    }
  };

  function checkWinner() {
    let win = false;
    // Check rows
    for (let i = 0; i < 3; i += 1) {
      if (board[i][0].getValue() === '-' || board[i][1].getValue() === '-' || board[i][2].getValue() === '-') {
        continue;
      }
      if (board[i][0].getValue() === board[i][1].getValue()
      && board[i][1].getValue() === board[i][2].getValue()) {
        win = true;
      }
    }

    // Check columns
    for (let i = 0; i < 3; i += 1) {
      if (board[0][i].getValue() === '-' || board[1][i].getValue() === '-' || board[2][i].getValue() === '-') {
        continue;
      }
      if (board[0][i].getValue() === board[1][i].getValue()
      && board[1][i].getValue() === board[2][i].getValue()) {
        win = true;
      }
    }

    // Check diagonals
    if (board[1][1].getValue() !== '-') {
      if (board[0][0].getValue() === board[1][1].getValue()
      && board[1][1].getValue() === board[2][2].getValue()) {
        win = true;
      } else if (board[0][2].getValue() === board[1][1].getValue()
    && board[1][1].getValue() === board[2][0].getValue()) {
        win = true;
      }
    }

    return win;
  }

  function boardFull() {
    if (board.some((row) => row[0].getValue() === '-' || row[1].getValue() === '-' || row[2].getValue() === '-')) {
      return false;
    }
    return true;
  }

  function reset() {
    board.forEach((row) => row.forEach((cell) => cell.addToken('-')));
  }

  return {
    getBoard, placeMark, checkWinner, boardFull, reset,
  };
}

/* The GameController will be responsible for controlling the
  ** flow and state of the game's turns, as well as whether
  ** anybody has won the game
  */
function GameController(
  playerOneName = 'Player One',
  playerTwoName = 'Player Two',
) {
  const board = Gameboard();

  const players = [
    {
      name: playerOneName,
      token: 'o',
      score: 0,
    },
    {
      name: playerTwoName,
      token: 'x',
      score: 0,
    },
  ];

  let activePlayer = players[0];

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };
  const getActivePlayer = () => activePlayer;

  // Variable to track if a winner is detected
  let winner = false;
  const getWinner = () => winner;

  // Variable to track if game is a tie
  let tie = false;
  const isTie = () => tie;

  const playRound = (position) => {
    // Drop a get input and place mark for the current player
    board.placeMark(position, getActivePlayer().token);

    // Check for a winner and let the seperate function handle the logic
    if (board.checkWinner() === true) {
    // Switch player turn
      winner = true;
      getActivePlayer().score += 1;
    } else if (board.boardFull() === true) {
      tie = true;
    } else {
      switchPlayerTurn();
    }
  };

  function reset() {
    board.reset();
    winner = false;
    tie = false;
  }

  return {
    playRound,
    getActivePlayer,
    getBoard: board.getBoard,
    getWinner,
    isTie,
    reset,
  };
}

function ScreenController() {
  const game = GameController();
  const boardDiv = document.querySelector('.board');

  const updateScreen = () => {
    // clear the board
    boardDiv.textContent = '';

    // get the newest version of the board and player turn
    const board = game.getBoard();

    // Render board squares
    board.forEach((row, index1) => {
      const rowNo = index1;
      row.forEach((cell, index2) => {
        // Anything clickable should be a button!!
        const cellButton = document.createElement('button');
        // Create a data attribute to identify the column
        // This makes it easier to pass into our `playRound` function
        if (rowNo === 0) {
          cellButton.dataset.id = index2;
        } else if (rowNo === 1) {
          cellButton.dataset.id = index2 + 3;
        } else {
          cellButton.dataset.id = index2 + 6;
        }
        cellButton.textContent = cell.getValue();
        boardDiv.appendChild(cellButton);
      });
    });
  };

  // Display game over message, update player score, reset board.
  function displayWinner(name, score) {
    // update score for winning player and alert
    if (name === 'Player One') {
      document.getElementById('score1').innerHTML = score;
    } else {
      document.getElementById('score2').innerHTML = score;
    }
    if (confirm(`${name} Wins!, Would you like to start a new game?`)) {
      game.reset();
      updateScreen();
    }
  }

  // Display tie message
  function displayTie() {
    if (confirm('Its a Tie! Click ok to try again')) {
      game.reset();
      updateScreen();
    }
  }

  // Add event listener for the board
  function clickHandlerBoard(e) {
    const selectedId = e.target.dataset.id;
    // Make sure I've clicked a column and not the gaps in between
    if (!selectedId) return;

    game.playRound(selectedId);
    updateScreen();
    // Check if game over
    if (game.getWinner() === true) {
      displayWinner(game.getActivePlayer().name, game.getActivePlayer().score);
    }
    if (game.isTie() === true) {
      displayTie();
    }
  }
  boardDiv.addEventListener('click', clickHandlerBoard);

  // Initial render
  updateScreen();
}

ScreenController();
