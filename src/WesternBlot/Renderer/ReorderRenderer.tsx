import * as React from 'react';
import { App } from '../../App';
import { Config } from '../../Types/Config';
import { IImageObject } from '../../Types/IImageObject';
import { WBBlotElement } from '../../Types/WBBlotElement';
import { WBWellLabelRowRenderer } from './WBWellLabelRowRenderer';

export interface IReorderRendererProps
{
    x: number;
    y: number;
    onUp: () => void;
    canUp: boolean;
    onDown: () => void;
    canDown: boolean;
}

export class ReorderRenderer extends React.Component<IReorderRendererProps, {}>
{
    public render(): JSX.Element
    {
        let x = this.props.x;
        let y = this.props.y;
        return <>
            {this.props.canUp && <>
                <line x1={x} y1={y - 3} x2={x} y2={y - 20}
                    stroke="red" stroke-width="8"
                    markerEnd="url(#arrowhead)"
                    style={{ cursor: "pointer" }}
                    onClick={() => this.props.onUp()} />
                <polygon
                    points={`${x - 10} ${y - 20}, ${x} ${y - 30}, ${x + 10} ${y - 20}`}
                    style={{ cursor: "pointer" }}
                    fill="red"
                    onClick={() => this.props.onUp()} />
            </>}
            
            {this.props.canDown && <>
                <line x1={x} y1={y + 3} x2={x} y2={y + 20}
                    stroke="red" stroke-width="8"
                    markerEnd="url(#arrowhead)" style={{ cursor: "pointer" }}
                    onClick={() => this.props.onDown()} />
                <polygon
                    points={`${x - 10} ${y + 20}, ${x} ${y + 30}, ${x + 10} ${y + 20}`}
                    style={{ cursor: "pointer" }}
                    fill="red"
                    onClick={() => this.props.onDown()} />
            </>}
        </>;
    }
}