'use strict';
const MINE = '💣'
var gLevel = {
    size: 4,
    mines: 2
}
var gIdxCount = 1;
var boardSize = gLevel.size;
var gMat = buildBoard(boardSize)
var isShown = false
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}


var gPos;
var currCell;
init()

function init() {
    renderBoard(gMat)
    setMinesNegsCount(gMat)
    console.table(gMat)
}

function buildBoard(board) {
    var mat = []
    for (var i = 0; i < board; i++) {
        var cells = []
        for (var j = 0; j < board; j++) {
            cells.push(createCell(i, j))
        }
        mat.push(cells)
    }
    // mat[1][1].isMine = true
    return mat
}


for (var j = 0; j < gLevel.mines - 1; j++) {
    var randLocation = mat[getRandomIntInclusive(1, gLevel.size - 1)][getRandomIntInclusive(1, gLevel.size - 1)].isMine
    randLocation = true
}

function renderBoard() {
    var strHtml = '';
    for (var i = 0; i < boardSize; i++) {
        strHtml += '<tr>';
        for (var j = 0; j < boardSize; j++) {
            var currCell = gMat[i][j]
            var pos = gMat[i][j].location
                //temp bomb position
            var cellClass = getClassName({ i: i, j: j })
            var cell = setMinesNegsCount(gMat, pos.i, pos.j);
            if (currCell.isMine) {
                cell = MINE
            }
            strHtml += `<td  class ="${cellClass}" onclick="cellClicked(this)"><span style = "visibility: hidden">${cell}</span></td>`
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
        isMarked: true,
        minesAroundCount: 0,
    }
    return cell
}

function cellClicked(click) {
    // console.log(click)
    console.log(getCellCoord(click.className))
    var cellContent = document.querySelector(`.${click.className} span`);
    cellContent.style.visibility = 'visible'
    console.log(click.className)

    document.querySelector("body > div > table > tbody > tr:nth-child(1) > td.cell.cell-0-0 > span")
}

function setMinesNegsCount(mat, rowIdx, colIdx) {
    var minesAroundCount = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > mat.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > mat[0].length - 1) continue
            if (i === rowIdx && j === colIdx) continue
            var currCell = mat[i][j];
            if (currCell.isMine) {
                minesAroundCount++
            }
        }
    }
    return minesAroundCount
}


function checkGameOver() {}

function expandShown(board, elCell, i, j) {

}