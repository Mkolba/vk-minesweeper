import React, {useState} from 'react';
import {Smile, SmileModes} from "../Smile/Smile";
import {Counter} from "../Counter/Counter";
import {Field} from "../Field/Field";
import {CellModes} from "../Cell/Cell";
import './MineSweeper.scss';
import {MouseButton} from "../../types";

type TimerType = NodeJS.Timeout | null

type GameStateType = 'active' | 'win' | 'lose' | 'inactive'

export type FieldCell = {
    mode: CellModes,
    is_mine: boolean,
    mines_around: number,
    readonly x: number,
    readonly y: number
}

const _cells:FieldCell[][] = [];
for (let row = 0; row < 16; row++) {
    _cells.push([])
    for (let col = 0; col < 16; col++) {
        _cells[row].push({
            mines_around: 0,
            mode: 'closed',
            is_mine: false,
            x: row,
            y: col,
        })
    }
}

const getNeighbors = (x: number, y: number, arr: FieldCell[][], dirs: number[][]) => {
    return dirs.map(([dX, dY]) => [ x + dX, y + dY ])
        // Убираем выходы за границы поля
        .filter(v => v[0] >= 0 && v[1] >= 0 && v[0] < 16 && v[1] < 16)
}

const getNeighborsWithMines = (x: number, y: number, arr: FieldCell[][]) => {
    const dirs = [
        [ -1, -1 ], [  0, -1 ], [ 1, -1 ],
        [ -1,  0 ],             [ 1,  0 ],
        [ -1,  1 ], [  0,  1 ], [ 1,  1 ]
    ];
    return getNeighbors(x, y, arr, dirs).filter(([x, y]) => arr[x][y]['is_mine'])
}

const getEmptyNeighbors = (x: number, y: number, arr: FieldCell[][]) => {
    if (arr[x][y]['mines_around'] !== 0) {
        const dirs = [
                        [  0, -1 ],
            [ -1,  0 ],             [ 1,  0 ],
                        [  0,  1 ],
        ];
        return getNeighbors(x, y, arr, dirs).filter(([x, y]) => {
            return arr[x][y]['mines_around'] === 0 && !arr[x][y]['is_mine'] && arr[x][y]['mode'] === 'closed'
        })
    } else {
        const dirs = [
            [ -1, -1 ], [  0, -1 ], [ 1, -1 ],
            [ -1,  0 ],             [ 1,  0 ],
            [ -1,  1 ], [  0,  1 ], [ 1,  1 ]
        ];
        return getNeighbors(x, y, arr, dirs).filter(([x, y]) => {
            return !arr[x][y]['is_mine'] && (arr[x][y]['mode'] === 'closed' || arr[x][y]['mode'] === 'question')
        })
    }
}

export const MineSweeper: React.FC = () => {
    let [cells, setCells] = useState<FieldCell[][]>(_cells)
    let [smileMode, setSmileMode] = useState<SmileModes>('default');
    let [gameState, setGameState] = useState<GameStateType>('inactive');
    let [bombsLeft, setBombsLeft] = useState<number>(40);
    let [timer, setTimer] = useState<TimerType>(null);
    let [time, setTime] = useState<number>(0);

    const startGame = (x: number, y: number) => {
        spawnBombs(x, y);
        setGameState('active');
        tick();
    }

    const checkIfGameCanBeWon = (cells_: FieldCell[][]) => {
        let flag = true;
        cells_.flat().forEach(({mode, is_mine}) => {
            if (mode === 'flag' && !is_mine) {
                flag = false
            }
            if (mode === 'closed' && is_mine) {
                flag = false
            }
        })
        return flag
    }

    const getCells = () : FieldCell[][] => {
        return JSON.parse(JSON.stringify(cells))
    }

    // Выставляет бомбы на поле, игнорируя ячейку, с которой начинает игрок
    const spawnBombs = (x: number, y: number, count: number = 40) => {
        let cells_ = getCells(); // deep copy
        let flatten = cells_.flat().filter((item: FieldCell) => item.x != x && item.y != y);

        const mines = flatten.sort(() => 0.5 - Math.random()).slice(0, count);

        mines.forEach(({x, y}) => {
            cells_[x][y]['is_mine'] = true;
        })

        for (let row = 0; row < 16; row++) {
            for (let col = 0; col < 16; col++) {
                if (!cells_[col][row]['is_mine']) {
                    cells_[col][row]['mines_around'] = getNeighborsWithMines(col, row, cells_).length;
                }
            }
        }
        cells_ = openCell(x, y, cells_);
        setCells(cells_)
    }

    // Считает внутриигровое время
    const tick = () => {
        setTime(++time);
        setTimer(setTimeout(() => {
            tick();
        }, 1000))
    }

    const restartGame = () => {
        setGameState('inactive');
        setSmileMode('default');
        if (timer) clearTimeout(timer);
        setTime(0);
        setBombsLeft(40);
        setCells(_cells);
    }

    const openCell = (x: number, y: number, cells_: FieldCell[][]) => {
        cells_[x][y]['mode'] = cells_[x][y].mines_around.toString() as CellModes
        let empty = getEmptyNeighbors(x, y, cells_);
        empty.map(([x, y]) => {
            cells_[x][y]['mode'] = cells_[x][y].mines_around.toString() as CellModes
            return openCell(x, y, cells_)
        })
        return cells_
    }

    const fireMine = (x: number, y: number, cells_: FieldCell[][]) => {
        cells_[x][y]['mode'] = 'mine_red'
        cells_.flat().forEach(({x, y, is_mine, mode}) => {
            if (mode !== 'mine_red') {
                if (is_mine && mode !== "flag") {
                    cells_[x][y]['mode'] = 'mine'
                } else if (!is_mine && mode === 'flag') {
                    cells_[x][y]['mode'] = 'mine_crossed'
                }
            }
        })

        setGameState('lose')
        if (timer) clearTimeout(timer);
        setSmileMode('dead')
        setCells(cells_);
    }

    const winGame = () => {
        setGameState('win')
        if (timer) clearTimeout(timer);
        setSmileMode('glasses')
    }

    const handleCellClick = (x: number, y: number, button: MouseButton) => {
        let cells_ = getCells(); // deep copy
        if (button === 'left') {
            if (gameState === 'inactive') {
                return startGame(x, y)
            }
            if (gameState !== 'active') {
                return
            }
            let cell = cells_[x][y];
            if (cell.mode === 'closed' || cell.mode === 'question') {
                if (cell.is_mine) {
                    return fireMine(x, y, cells_)
                } else {
                    cells_ = openCell(x, y, cells_)
                    if (checkIfGameCanBeWon(cells_)) {
                        winGame();
                    }
                }
            }
            setCells(cells_)
        } else {
            let cell = cells_[x][y]
            let mode = cell.mode;
            switch (mode) {
                case "closed":
                    if (bombsLeft > 0) {
                        cell['mode'] = 'flag'
                        setBombsLeft(--bombsLeft)
                    }
                    break
                case "flag":
                    cell['mode'] = 'question'
                    setBombsLeft(++bombsLeft)
                    break
                case "question":
                    cell['mode'] = 'closed'
                    break
            }
            setCells(cells_);
        }
    }

    return (
        <div className={'MineSweeper'}>
            <div className={'Header'}>
                <Counter value={bombsLeft}/>
                <Smile mode={smileMode} onClick={restartGame}/>
                <Counter value={time}/>
            </div>
            <Field cells={cells} setSmileMode={(mode) => {
                if (gameState !== 'lose' && gameState !== 'win') setSmileMode(mode)
            }} handleCellClick={handleCellClick}/>
        </div>
    )
}