import React, {useRef} from 'react';
import './Smile.scss';

export type SmileModes = 'default' | 'surprised' | 'glasses' | 'dead'

interface SmileProps extends React.HTMLAttributes<HTMLDivElement> {
    mode: SmileModes,
    onClick?: React.MouseEventHandler<HTMLElement>
}

export const Smile: React.FC<SmileProps> = ({mode, onClick}: SmileProps) => {
    let ref = useRef<HTMLDivElement>(null);

    const handleMouseDown: React.MouseEventHandler = (e) => {
        if (ref.current) {
            ref.current.classList.add('active')
        }
    }

    const handleMouseUp: React.MouseEventHandler = (e) => {
        if (ref.current) {
            ref.current.classList.remove('active')
        }
    }

    return (
        <div
            className={'Smile Smile_' + mode}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onClick={onClick}
            ref={ref}
        />
    )
}