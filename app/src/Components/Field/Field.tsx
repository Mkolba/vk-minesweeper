import React from 'react';
import {Cell} from "../Cell/Cell";
import './Field.scss';
import {SmileModes} from "../Smile/Smile";
import {FieldCell} from "../MineSweeper/MineSweeper";
import {MouseButton} from "../../types";

interface FieldProps extends React.HTMLAttributes<HTMLElement> {
    cells: FieldCell[][],
    setSmileMode: React.Dispatch<React.SetStateAction<SmileModes>>,
    handleCellClick: (x: number, y: number, button: MouseButton) => void
}

export const Field: React.FC<FieldProps> = ({cells, setSmileMode, handleCellClick}: FieldProps) => {
    return (
        <div className={'Field'}>
            <table>
                <tbody>
                    {cells.map((row, row_key) => (
                        <tr className={'Row'} key={row_key}>
                            {row.map((cell, cell_key) => (
                                <Cell
                                    {...cell}
                                    x={row_key}
                                    y={cell_key}
                                    key={`${row_key}-${cell_key}`}
                                    setSmileMode={setSmileMode}
                                    handleCellClick={handleCellClick}
                                />
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}