'use strict';
const FLAG = '🚩';
const MINE = '💣';
const HEART = '💖';
var gLevel = {
    size: 4,
    mines: 2
};
var lastActions = [];
var isProcessing = false;
var gIdxCount = 1;
var boardSize = gLevel.size;
var isShown = false;
var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
};
var safeClickCount = 3;
var flickerInterval;
var minesAroundCount;
var myTimer; //interval
var currCell;
var gMat;
var clickCount = 0;
var livesCounter = 1;

function init() {
    gMat = buildBoard(boardSize);
    renderBoard(gMat);
    getMinesNegsCount(gMat);
    document.querySelector("button").innerText = '😃';
    renderHearts();
    renderHints();
    renderSafeClick()
    clickCount = 0
    console.table(gMat)
    bestScore()
}

function buildBoard(board) {
    var mat = [];
    for (var i = 0; i < board; i++) {
        var cells = [];
        for (var j = 0; j < board; j++) {
            cells.push(createCell(i, j));
        }
        mat.push(cells);
    }
    placeMines(mat);
    return mat;
}

function placeMines(mat) {
    for (var j = 0; j < gLevel.mines; j++) {
        mat[getRandomIntInclusive(0, gLevel.size - 1)][getRandomIntInclusive(0, gLevel.size - 1)].isMine = true;
    }
}

function renderBoard() {
    var strHtml = '';
    for (var i = 0; i < boardSize; i++) {
        strHtml += '<tr>';
        for (var j = 0; j < boardSize; j++) {
            var currCell = gMat[i][j];
            var pos = gMat[i][j].location;
            var cellClass = getClassName({ i: i, j: j });
            var cell = getMinesNegsCount(gMat, pos.i, pos.j);
            currCell.minesAroundCount = cell;
            if (cell === 0) cell = '';
            if (currCell.isMine) {
                cell = MINE;
            }
            strHtml += `<td  class ="${cellClass}" onclick="cellLeftClicked(this)" oncontextmenu="cellRightClicked(event, this)"><span class="spec" style = "visibility: hidden">${cell}</span></td>`;
        }
        strHtml += '</tr>';
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHtml;
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
    };
    return cell;
}

function timer() {
    var startTime = Date.now();
    myTimer = setInterval(function() {
        var elapsedTime = Date.now() - startTime;
        document.getElementById("timer").innerHTML = (elapsedTime / 1000).toFixed(3);
    }, 100);
}

function cellLeftClicked(click) {
    //undo btn:
    saveLastAction()
        //==========
    isProcessing = false;
    clearInterval(flickerInterval);
    clickCount++;
    console.log('clickCount', clickCount);
    var elCellContent = document.querySelector(`.${click.className} span`);
    var elTd = document.querySelector(`.${click.className}`);
    if (clickCount === 1) {
        timer();
    }
    if (gGame.isOn) {
        var coords = getCellCoord(click.className);
        var cell = gMat[coords.i][coords.j];

        //deny imediate loss = not yet working(bug list bellow)------
        if (clickCount === 1 && cell.isMine) {
            clearInterval(myTimer)
            cell.isMine = false
                // gGame.shownCount--;
            init();
            console.log('there was a mine here!')
                // isProcessing = false;
            clickCount = 0;
        }
        //BUG: cant use hints/safe click unless i click a cell
        //BUG: won't always show the cell i clicked on.
        //------------------------------------------------------------
        else if (!cell.isShown) {
            elCellContent.style.visibility = 'visible';
            click.style.border = `${1}px solid pink`
            cell.isShown = true;
            gGame.shownCount++;
            console.log('gGame.shownCount', gGame.shownCount);
        }
    }
    if (elCellContent.innerText === MINE && clickCount > 1) {
        checkGameOver();
        elTd.style.backgroundColor = 'red';
    }
    var cellPos = getCellCoord(click.className);
    var cell = gMat[cellPos.i][cellPos.j];
    if (cell.minesAroundCount === 0) {
        openCellsAround(gMat, cellPos.i, cellPos.j);
    }
    // console.log(cell)
    checkVictory(cell);

}

function getCellInnerText(cell) {
    if (cell.isMarked) {
        return FLAG;
    }
    if (cell.isMine) {
        return MINE;
    }
    // console.log(cell.minesAroundCount)
    return cell.minesAroundCount;
}

function cellRightClicked(event, click) {
    //undo btn:
    saveLastAction()
        //==========
    isProcessing = false;
    event.preventDefault();
    clearInterval(flickerInterval);
    var coords = getCellCoord(click.className);
    var cell = gMat[coords.i][coords.j];
    var elCellContent = document.querySelector(`.${click.className} span`);
    if (gGame.isOn && !cell.isShown) {
        cell.isMarked = !cell.isMarked
        elCellContent.innerText = getCellInnerText(cell);
        if (cell.isMarked) {
            elCellContent.style.visibility = 'visible';
            gGame.markedCount++;
            click.removeAttribute("onclick", );
            console.log('gGame.markedCount', gGame.markedCount);
        } else {
            elCellContent.style.visibility = 'hidden';
            cell.isShown = false;
            gGame.markedCount--;
            click.setAttribute("onclick", "cellLeftClicked(this)");
        }
    }
    checkVictory(cell);
    return false;
}

function getMinesNegsCount(mat, rowIdx, colIdx) {
    minesAroundCount = 0;
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > mat.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > mat[0].length - 1) continue;
            if (i === rowIdx && j === colIdx) continue;
            var currCell = mat[i][j];
            if (currCell.isMine) {
                minesAroundCount++;
            }
        }
    }
    return minesAroundCount;
}

function checkGameOver() {
    isProcessing = true;
    if (livesCounter !== 0) livesCounter--;
    renderHearts();
    if (livesCounter === 0 && clickCount !== 1) {
        gGame.isOn = false;
        clearInterval(myTimer);
        document.querySelector("button").innerText = '💀';
        showMines();
        lastActions = [];

    }
}

function checkVictory(cell) {
    if (gGame.shownCount + gGame.markedCount === gLevel.size ** 2) {
        if (cell.isMine) return;
        document.querySelector("button").innerText = '😎';
        clearInterval(myTimer);
        //local storage and best scores:
        bestScore()
        gGame.isOn = false;
        isProcessing = true
    }
}

function bestScore() {
    //grab the timer and the best score div:
    var elBestScore = document.querySelector(".bestScore")
    var score = document.querySelector("#timer").innerText;
    var getLocalStorage = localStorage.getItem('Best Score', score)

    //handle which level we are on:
    // var elBtns = document.querySelectorAll('input[name="choice"]');
    // for (var i = 0; i < 3; i++) {
    //     var elBtn = elBtns[i]
    //     console.log('elBtn', elBtn.value);
    // }

    //if there isnt a best score recorded yet:
    if (getLocalStorage === null || getLocalStorage === 'TIMER') {
        localStorage.setItem('Best Score', score);
        elBestScore.innerText = 'Best Score: ' + bestScore;
    }
    //check best score vs curr-score:
    if (getLocalStorage > score) {
        localStorage.setItem('Best Score', score);
    }
    //set the faster score:
    var bestScore = getLocalStorage;
    elBestScore.innerText = `Best Score: ${bestScore}`;

}

function restartBtn() {
    //re-deploy hearts:
    var btns = document.querySelectorAll('input[name="choice"]');
    if (btns[0].checked) livesCounter = 1;
    if (btns[1].checked) livesCounter = 2;
    if (btns[2].checked) livesCounter = 3;

    lastActions = [];
    clearInterval(myTimer)
    document.querySelector("#timer").innerText = 'TIMER';
    clickCount = 0;
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    safeClickCount = 3;
    gGame.isOn = true
    isProcessing = false
    renderHearts();
    init();

}

function difficulty(press) {
    // constrol size of td. not working yet..
    // var elCells = document.querySelectorAll("td");
    // for (var i = 0; i < gLevel.size ** 2; i++) {
    //     var cell = elCells[i];
    //     console.log(cell);
    // }
    var btns = document.querySelectorAll('input[name="choice"]');
    if (press) {
        if (btns[0].checked) {
            console.log('easy')
            gLevel = {
                size: 4,
                mines: 2
            }
            boardSize = 4;
            livesCounter = 1
            restartBtn()
                // cell.style.height = 80 + 'px'
                // cell.style.width = 80 + 'px'
        }
        if (btns[1].checked) {
            console.log('med')
            gLevel = {
                size: 8,
                mines: 12
            }
            boardSize = 8;
            livesCounter = 2
            restartBtn()
                // cell.style.height = 40 + 'px'
                // cell.style.width = 40 + 'px'
        }
        if (btns[2].checked) {
            console.log('hard')
            gLevel = {
                size: 12,
                mines: 30
            }
            boardSize = 12;
            livesCounter = 3
            restartBtn()

            // cell.style.height = 20 + 'px'
            // cell.style.width = 20 + 'px'
        }
        boardSize = gLevel.size
        init()
        clearInterval(myTimer);
    }
}

function openCellsAround(mat, rowIdx, colIdx) {
    if (!gGame.isOn) return
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > mat.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > mat[0].length - 1) continue
            if (i === rowIdx && j === colIdx) continue
            var currCell = mat[i][j];
            if (currCell.isMine) return
            if (!currCell.isShown) {
                currCell.isShown = true;
                gGame.shownCount++;
                console.log('gGame.shownCount', gGame.shownCount)
                var cellClass = getClassName({ i: i, j: j });
                var elCellContent = document.querySelector(`.${cellClass} span`);
                var elCell = document.querySelector(`.${cellClass} `);

                //handeling cells appearance after click
                elCell.style.border = `${1}px solid pink`
                elCellContent.style.visibility = 'visible';

                if (currCell.minesAroundCount === 0) {
                    openCellsAround(gMat, i, j);
                }
            }
        }
    }
}

function renderHearts() {
    var strHtml = '';
    for (var i = 0; i < livesCounter; i++) {
        strHtml += `<div class="heart${i+1}" style = "display: inline-block">${HEART}</div>`
    }
    var elLives = document.querySelector('.lives')
    elLives.innerHTML = strHtml
}

function showMines() {
    for (var i = 0; i < gMat.length; i++) {
        for (var j = 0; j < gMat.length; j++) {
            var cellClass = getClassName({ i: i, j: j });
            var elCellContent = document.querySelector(`.${cellClass} span`);
            var cell = gMat[i][j]
            if (cell.isMine) elCellContent.style.visibility = 'visible'

        }
    }
}

function getHint(click) {
    if (gGame.isOn && !isProcessing) {

        click.innerHTML = `<img class = "hint" src = "/img/bulb.png">`
        document.querySelector(`.${click.classList[0]} img`).style.cursor = 'default'
        click.removeAttribute('onclick')
        for (var i = 0; i < gMat.length; i++) {
            for (var j = 0; j < gMat.length; j++) {
                var cellClass = getClassName({ i: i, j: j });
                var elCellContent = document.querySelector(`.${cellClass} span`);
                var cell = gMat[i][j]
                if (cell.isMine && !cell.isShown && !cell.isMarked) {
                    isProcessing = true;
                    flickerInterval = setInterval(function() {
                        elCellContent.style.visibility = (elCellContent.style.visibility === 'hidden') ? "visible" : 'hidden';
                    }, 300)
                    return
                }
            }
        }
    }
}

function renderHints() {
    var strHtml = '';
    for (var i = 0; i < livesCounter; i++) {
        strHtml += `<div class="hint${i+1}" onclick = "getHint(this)" style = "display: inline-block"><img class = "hint" src = "/img/lightbulb.png"></div>`
    }
    var elHints = document.querySelector('.hints')
    elHints.innerHTML = strHtml
}

function safeClickBtn() {
    if (safeClickCount > 0 && !isProcessing) {
        safeClickCount--
        renderSafeClick()
        for (var i = 0; i < gMat.length; i++) {
            for (var j = 0; j < gMat.length; j++) {
                var cellClass = getClassName({ i: i, j: j });
                var elCellContent = document.querySelector(`.${cellClass}`);
                var cell = gMat[i][j]
                if (!cell.isMine && !cell.isShown && !cell.isMarked) {
                    isProcessing = true;
                    flickerInterval = setInterval(function() {
                        elCellContent.style.backgroundColor = (elCellContent.style.backgroundColor === 'lightgreen') ? "rgba(255, 255, 240, 0.521)" : 'lightgreen';
                    }, 300)
                    return
                }
            }
        }
    }
}

function renderSafeClick() {
    var strHtml = '';
    strHtml += `<button class="safeClickBtn" onclick="safeClickBtn(this)">Safe Click(${safeClickCount})</button>`;
    var elSafeClick = document.querySelector('.safeClick')
    elSafeClick.innerHTML = strHtml
}




function saveLastAction() {
    lastActions.push(gMat)
    console.log(lastActions)
}

function undoBtn() {
    console.log(lastActions)
    var lastMoment = lastActions.pop()
    gMatCopy = lastMoment ? lastMoment : gMat
        // render resets the whole board. how do i render only last action?
        // renderBoard(gMat)
}