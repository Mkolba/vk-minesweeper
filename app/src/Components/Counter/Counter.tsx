import React from 'react';
import './Counter.scss';

interface CounterProps extends React.HTMLAttributes<HTMLDivElement> {
    value: number
}

export const Counter: React.FC<CounterProps> = ({value}: CounterProps) => {
    let count: string = value <= 999 ? value.toString() : "999";

    if (count.length === 1) {
        count = '00' + count;
    } else if (count.length === 2) {
        count = '0' + count;
    }

    return (
        <div className={'Counter'}>
            {count.split('').map((item, key) => (
                <div className={'Digit Digit_' + item} key={key}/>
            ))}
        </div>
    )
}