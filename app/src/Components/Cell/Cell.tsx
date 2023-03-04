import React, {useRef} from 'react';
import {SmileModes} from "../Smile/Smile";
import './Cell.scss';
import {MouseButton} from "../../types";

export type CellModes = 'closed' | 'flag' | 'question' | 'mine' | 'mine_red' | 'mine_crossed' | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';

interface CellProps extends React.HTMLAttributes<HTMLElement> {
    setSmileMode: React.Dispatch<React.SetStateAction<SmileModes>>,
    handleCellClick: (x: number, y: number, button: MouseButton) => void,
    mode?: CellModes,
    is_mine: boolean,
    x: number,
    y: number,
}

export const Cell: React.FC<CellProps> = ({
    handleCellClick,
    mode = 'closed',
    setSmileMode,
    is_mine,
    x,
    y
}: CellProps) => {
    const ref = useRef<HTMLTableCellElement>(null)

    const handleMouseDown: React.MouseEventHandler = (e) => {
        if (mode !== 'flag' || e.button !== 0) {
            setSmileMode('surprised')
        }
        
        if (e.button === 0 && ref.current) {
            ref.current.classList.add('active');
        }
    }

    const handleRightMouseClick: React.MouseEventHandler = (e) => {
        e.preventDefault()
        handleCellClick(x, y, 'right')
    }

    const handleMouseUp: React.MouseEventHandler = (e) => {
        if (!is_mine) {
            setSmileMode('default')
        }
        if (ref.current) {
            ref.current.classList.remove('active');
        }
    }

    return (
        <td
            ref={ref}
            className={'Cell Cell_' + mode}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onContextMenu={handleRightMouseClick}
            onClick={() => handleCellClick(x, y, "left")}
        />
    )
}