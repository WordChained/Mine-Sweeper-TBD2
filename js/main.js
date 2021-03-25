'use strict';
const FLAG = '🚩'
const MINE = '💣'
var gLevel = {
    size: 4,
    mines: 2
}
var gIdxCount = 1;
var boardSize = gLevel.size;
var isShown = false
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}
var minesAroundCount;
var myTimer
var currCell;
var gMat;
var clickCount = 0
init()

function init() {
    gMat = buildBoard(boardSize)
    renderBoard(gMat)
    setMinesNegsCount(gMat)
    document.querySelector("button").innerText = '😃'

}
console.table(gMat)

function buildBoard(board) {
    var mat = []
    for (var i = 0; i < board; i++) {
        var cells = []
        for (var j = 0; j < board; j++) {
            cells.push(createCell(i, j))
        }
        mat.push(cells)
    }
    for (var j = 0; j < gLevel.mines; j++) {
        console.log(mat[getRandomIntInclusive(1, gLevel.size - 1)])
        mat[getRandomIntInclusive(1, gLevel.size - 1)][getRandomIntInclusive(1, gLevel.size - 1)].isMine = true
    }
    return mat
}


function renderBoard() {
    var strHtml = '';
    for (var i = 0; i < boardSize; i++) {
        strHtml += '<tr>';
        for (var j = 0; j < boardSize; j++) {
            var currCell = gMat[i][j]
            var pos = gMat[i][j].location
            var cellClass = getClassName({ i: i, j: j })
            var cell = setMinesNegsCount(gMat, pos.i, pos.j);
            currCell.minesAroundCount = cell;

            // if (cell === 0)
            if (currCell.isMine) {
                cell = MINE;
            }
            strHtml += `<td  class ="${cellClass}" onclick="cellLeftClicked(this)" oncontextmenu="cellRightClicked(event, this)"><span style = "visibility: hidden">${cell}</span></td>`
        }
        strHtml += '</tr>'
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHtml
}


function createCell(i, j) {
    var cell = {
        location: {
            i: i,
            j: j
        },
        isShown: false,
        isMine: false,
        isMarked: false,
        minesAroundCount: 0,
    }
    return cell
}

function cellLeftClicked(click) {

    clickCount++
    var cellContent = document.querySelector(`.${click.className} span`);
    if (clickCount === 1) {
        gGame.isOn = true;
        var startTime = Date.now();
        myTimer = setInterval(function() {
            var elapsedTime = Date.now() - startTime;
            document.getElementById("timer").innerHTML = (elapsedTime / 1000).toFixed(3);
        }, 100);
    }
    if (gGame.isOn) {
        var coords = getCellCoord(click.className)
        var cell = gMat[coords.i][coords.j];
        if (!cell.isShown) {
            cell.isShown = true
            cellContent.style.visibility = 'visible';
            gGame.shownCount++
        }
    }
    if (cellContent.innerText === MINE) {
        checkGameOver();
    }
    checkVictory();
    var cellPos = getCellCoord(click.className)
    var cell = gMat[cellPos.i][cellPos.j];
    console.log(cell)
    if (cell.minesAroundCount === 0) {
        openCellsAround(gMat, cellPos.i, cellPos.j)
    }
}

function getCellInnerText(cell) {
    if (cell.isMarked) {
        return FLAG;
    }
    if (cell.isMine) {
        return MINE;
    }
    console.log(cell.minesAroundCount)
    return cell.minesAroundCount;
}

function cellRightClicked(event, click) {
    event.preventDefault();
    console.log(click)
    var coords = getCellCoord(click.className)
    var cell = gMat[coords.i][coords.j];
    var cellContent = document.querySelector(`.${click.className} span`);
    if (gGame.isOn) {
        cell.isMarked = !cell.isMarked
        cellContent.innerText = getCellInnerText(cell);
        if (cell.isMarked) {
            cellContent.style.visibility = 'visible'
            gGame.markedCount++
                console.log('gGame.markedCount', gGame.markedCount);
        } else {
            cellContent.style.visibility = 'hidden'
            cell.isShown = false
            gGame.markedCount--
        }
    }
    checkVictory();
    return false
}

function setMinesNegsCount(mat, rowIdx, colIdx) {
    minesAroundCount = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > mat.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > mat[0].length - 1) continue
            if (i === rowIdx && j === colIdx) continue
            var currCell = mat[i][j];
            if (currCell.isMine) {
                // console.log(mat[i][j].minesAroundCount)
                // var negs = mat[i][j].minesAroundCount++
                minesAroundCount++
            }
        }
    }
    return minesAroundCount
}

function negs(mat, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > mat.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > mat[0].length - 1) continue
            if (i === rowIdx && j === colIdx) continue
            var currCell = mat[i][j];
            currCell.isShown = true
        }
    }
}

function checkGameOver() {
    gGame.isOn = false;
    clearInterval(myTimer)
        // change smiley:
    document.querySelector("button").innerText = '💀'
}

function checkVictory() {
    if (gGame.shownCount + gGame.markedCount === gLevel.size ** 2) {
        document.querySelector("button").innerText = '😎'
        clearInterval(myTimer)
        gGame.isOn = false;

    }
}

function expandShown(board, elCell, i, j) {

}

function restartBtn() {
    clearInterval(myTimer)
    document.querySelector("#timer").innerText = 'TIMER';
    clickCount = 0
    init()
    gGame.shownCount = 0
    gGame.markedCount = 0
}

function difficulty(press) {
    var btns = document.querySelectorAll('input[name="choice"]')
    if (press) {
        if (btns[0].checked) {
            console.log('easy')
            gLevel = {
                size: 4,
                mines: 2
            }
            boardSize = 4;

        }
        if (btns[1].checked) {
            console.log('med')
            gLevel = {
                size: 8,
                mines: 12
            }
            boardSize = 8;

        }
        if (btns[2].checked) {
            console.log('hard')
            gLevel = {
                size: 12,
                mines: 30
            }
            boardSize = 12;
        }
        boardSize = gLevel.size
        init()
        clearInterval(myTimer);

    }
}

function openCellsAround(mat, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > mat.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > mat[0].length - 1) continue
            if (i === rowIdx && j === colIdx) continue
            var currCell = mat[i][j];
            if (!currCell.isShown) {
                currCell.isShown = true;
                gGame.shownCount++
                    var cellClass = getClassName({ i: i, j: j });
                var cellContent = document.querySelector(`.${cellClass} span`);
                cellContent.style.visibility = 'visible';
                if (currCell.minesAroundCount === 0) {
                    openCellsAround(gMat, i, j);
                    console.log(gGame.shownCount)
                }
            }
        }
    }
}