import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
const R = require('ramda');

class Board extends React.Component {
  renderSquare(i) {
    var key = "square" + i;
    return (
      <Square
        key={key}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    var rows = [];
    var cells = [];
    var cellNumber = 0;
    for (var i = 0; i < this.props.rows; i++) {
      for (var j = 0; j < this.props.cols; j++) {
        cells.push(this.renderSquare(cellNumber))
        cellNumber++
      }
      rows.push(<div key={i} className="board-row">{cells}</div>)
      cells = [];
    }
    return (
      <div>
        {rows}
      </div>
    );
  }
}

class Domino extends React.Component {
  constructor(props) {
    super(props);
    let rows = 9;
    let cols = 9;

    this.state = {
      rows: rows,
      cols: cols,
      history: [{
        squares: Array(rows * cols).fill(5)
      }],
      pl1: 0,
      pl2: 0,
      winner: 0,
      stepNumber: 0,
      xIsNext: false
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    var squares = current.squares.slice();

    var col = i % this.state.cols;
    var row = Math.floor(i / this.state.rows);

    if (checkWinner(this.state.pl1, this.state.pl2) == 0) {
      var moveArray = Array(this.state.rows * this.state.cols).fill(0);
      moveArray = moveArray.map((value, index, moveArray) =>
        (index % this.state.cols === col || Math.floor(index / this.state.rows) === row) ?
          moveArray[index] = 1 : moveArray[index] = 0
      );

      if (this.state.xIsNext) {
        if (current.squares[i] !== 0) {
          squares[i] = current.squares[i] + 1;
        }
        squares = R.zipWith(squareSum, squares, moveArray);
      } else {
        if (current.squares[i] !== 10) {
          squares[i] = current.squares[i] - 1;
        }
        squares = R.zipWith(squareSub, squares, moveArray);
      }
      var pointPl1 = R.without(R.without([0], squares), squares).length;
      var pointPl2 = R.without(R.without([10], squares), squares).length;

      this.setState({
        history: history.concat([{
          squares: squares
        }]),
        pl1: pointPl1,
        pl2: pointPl2,
        winner: checkWinner(pointPl1, pointPl2),
        stepNumber: history.length,
        xIsNext: !this.state.xIsNext,
      });
    }
  }

  jumpTo(step) {

    var pointPl1 = R.without(R.without([0], this.state.history[step]), this.state.history[step]).length;
    var pointPl2 = R.without(R.without([10], this.state.history[step]), this.state.history[step]).length;

    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
      pl1: pointPl1,
      pl2: pointPl2,
      winner: checkWinner(pointPl1, pointPl2),
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];

    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move :
        'Go to game start';
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });


    return (
      <div class="wrapper">

        <div className="game">
          <div className="game-board">
            <Players
              current={this.state.xIsNext}
              pl1points={this.state.pl1}
              pl2points={this.state.pl2}
              winner={this.state.winner}
            />
            <Board
              squares={current.squares}
              cols={this.state.cols}
              rows={this.state.rows}
              onClick={(i) => this.handleClick(i)}
            />
          </div>
          <div className="game-info">
            <ol>{moves}</ol>
          </div>
        </div>
      </div>
    );
  }
}

function Square(props) {
  var classname = "square color" + props.value;
  return (
    <div className={classname} onClick={props.onClick}>
      <div class="number">{props.value}</div>
    </div>
  );
}

function Players(props) {
  var classPl1 = "player color0";
  var classPl2 = "player color10";
  if (props.winner === 1) {
    classPl1 += " winner";
  } else if (props.winner === 2) {
    classPl2 += " winner";
  } else {
    if (!props.current) {
      classPl1 += " active";
    } else {
      classPl2 += " active";
    }
  }
  return (
    <div class="players">
      <div class={classPl1}>
        Giocatore1
        <div class="points"> {props.pl1points}</div>
      </div>
      <div class={classPl2}>
        Giocatore2
        <div class="points"> {props.pl2points}</div>
      </div>
    </div>
  );
}
// ========================================

ReactDOM.render(
  <Domino />,
  document.getElementById('root')
);

function checkWinner(pl1, pl2) {
  var winner = 0;
  if (pl1 >= 10) {
    winner = 1;
  }
  if (pl2 >= 10) {
    winner = 2;
  }
  return winner;
}

const squareSum = (x, y) => {
  if (x === 0 || x === 10) {
    return x;
  }
  if (x + y < 11) {
    return x + y;
  } else {
    return 10;
  };
};

const squareSub = (x, y) => {
  if (x === 0 || x === 10) {
    return x;
  }
  if (x - y > 0) {
    return x - y;
  } else {
    return 0;
  };
};