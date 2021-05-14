import * as React from 'react';
import { App } from '../../App';
import { Config } from '../../Types/Config';
import { IImageObject } from '../../Types/IImageObject';
import { getTextProperties } from '../../Types/TextProperties';
import { WBBlotElement } from '../../Types/WBBlotElement';
import { WBWellLabelRowRenderer } from './WBWellLabelRowRenderer';

export interface IWBElementRendererProps
{
    config: Config;
    setConfig: (config: Config) => void;

    offset: number;
    index: number;
    selected: boolean;

    embedImages: boolean;
    element: WBBlotElement;
    rendering: boolean;
    image: IImageObject;
    select: () => void;
    onChange: (element: WBBlotElement) => void;
}

interface IWBElementRendererState
{
    mouseMoveAction?: MouseMoveAction;
}

type MouseMoveActionType = "pan" | "resize-height" | "resize-width";
type MouseMoveAction = {
    mouseMoveHandler: (ev: MouseEvent) => void,
    mouseUpHandler: (ev: MouseEvent) => void;
    lastMouseX: number,
    lastMouseY: number,
    type: MouseMoveActionType
};

export class WBElementRenderer extends React.Component<IWBElementRendererProps, IWBElementRendererState>
{
    constructor(props: IWBElementRendererProps)
    {
        super(props);
        this.state = {

        };
    }

    private beginMouseMove(e: React.MouseEvent<SVGRectElement>, action: MouseMoveActionType)
    {
        let mouseMoveHandler = this.updateMouseMove.bind(this);
        let mouseUpHandler = this.endMouseMove.bind(this);
        window.addEventListener("mousemove", mouseMoveHandler);
        window.addEventListener("mouseup", mouseUpHandler);
        this.setState({
            mouseMoveAction: {
                lastMouseX: e.screenX,
                lastMouseY: e.screenY,
                mouseMoveHandler: mouseMoveHandler,
                mouseUpHandler: mouseUpHandler,
                type: action,
            }
        });
    }

    private endMouseMove()
    {
        window.removeEventListener("mousemove", this.state.mouseMoveAction.mouseMoveHandler);
        window.removeEventListener("mouseup", this.state.mouseMoveAction.mouseUpHandler);
        this.setState({ mouseMoveAction: undefined });
    }

    private updateMouseMove(ev: MouseEvent)
    {
        if (this.state.mouseMoveAction !== undefined)
        {
            let deltaXUntransformed = ev.screenX - this.state.mouseMoveAction.lastMouseX;
            let deltaYUntransformed = ev.screenY - this.state.mouseMoveAction.lastMouseY;
            let element = this.props.element;
                
            // Rotate the mouse movement vector with the image, so the pan is relative to the rotated image
            let cos = Math.cos(element.boundingBox.rotation / 180 * Math.PI);
            let sin = Math.sin(element.boundingBox.rotation / 180 * Math.PI);
            let deltaX = deltaXUntransformed * cos - deltaYUntransformed * sin;
            let deltaY = deltaXUntransformed * sin + deltaYUntransformed * cos;

            if (this.state.mouseMoveAction.type === "pan")
            {
                this.props.onChange({
                    ...element,
                    boundingBox: {
                        ...element.boundingBox,
                        x: element.boundingBox.x - deltaX,
                        y: element.boundingBox.y - deltaY,
                    }
                });
            }
            else if (this.state.mouseMoveAction.type === "resize-height")
            {
                this.props.onChange({
                    ...element,
                    height: element.height + deltaYUntransformed,
                });
            }
            else if (this.state.mouseMoveAction.type === "resize-width")
            {
                this.props.setConfig({
                    ...this.props.config,
                    blotWidth: this.props.config.blotWidth + deltaXUntransformed
                });
            }

            this.state.mouseMoveAction.lastMouseX = ev.screenX;
            this.state.mouseMoveAction.lastMouseY = ev.screenY;
        }
    }

    public render(): JSX.Element
    {
        let strokeWidth = this.props.config.strokeWidth;

        let element = this.props.element;
        let offset = this.props.offset;
        let selected = this.props.selected;
        let imageScale = this.props.config.blotWidth / element.boundingBox.width;
        let rowLabelTextProperties = getTextProperties(element.labelTextProperties, this.props.config.defaultTextProperties);
        return <g>
            { /* Render the image with clipping */}
            <clipPath id={"element-image-clip-" + this.props.index}>
                <rect x="0" y={offset} height={element.height} width={this.props.config.blotWidth}></rect>
            </clipPath>
            <g style={{ clipPath: "url(#element-image-clip-" + this.props.index + ")" }}>
                <image
                    id={element.imageIndex !== undefined ? "image-" + element.imageIndex : undefined}
                    width={this.props.image.size.width}
                    height={this.props.image.size.height}
                    transform={`scale(${imageScale}),` +
                        `translate(${element.boundingBox.width * 0.5}, ${(element.height * 0.5 + offset) / imageScale}),` +
                        `rotate(${-element.boundingBox.rotation})` +
                        `translate(${-element.boundingBox.x}, ${-element.boundingBox.y})`}
                    style={{ filter: `invert(${element.imageProperties.inverted ? 1 : 0}) brightness(${element.imageProperties.brightness}%) contrast(${element.imageProperties.contrast}%)` }}
                    xlinkHref={this.props.embedImages ? this.props.image.data : this.props.image.name}></image>
            </g>

            { /* Render the outline */}
            <rect x={strokeWidth * 0.5} y={offset + strokeWidth * 0.5} height={element.height - strokeWidth} width={this.props.config.blotWidth - strokeWidth}
                stroke={selected && !this.props.rendering ? "red" : "black"}
                strokeWidth={this.props.config.strokeWidth}
                fill="none"></rect>
            {!this.props.rendering && <rect x={0} y={offset} height={element.height} width={this.props.config.blotWidth}
                fill="transparent"
                onClick={() => this.props.select()}
                onMouseDown={e => selected && this.beginMouseMove(e, "pan")}
                style={{ cursor: selected ? (this.state.mouseMoveAction !== undefined ? 'grabbing' : 'grab') : 'pointer' }}></rect>}
            
            { /* Render the label */}
            {(this.props.rendering || !selected) && <text
                y={offset + element.height * 0.5}
                x={this.props.config.blotWidth + this.props.config.elementLabelSpacing}
                fontWeight={rowLabelTextProperties.bold ? "bold" : "normal"}
                fontStyle={rowLabelTextProperties.italic ? "italic" : "normal"}
                fontSize={rowLabelTextProperties.size}
                onClick={() => this.props.select()}
                dominantBaseline="central">{element.label}</text>}
            
            { /* Render editor utilities */}
            {!this.props.rendering && <>
                <rect x={0} y={offset + element.height - 5} height={10} width={this.props.config.blotWidth} fill="transparent" cursor="s-resize"
                    onMouseDown={e => this.beginMouseMove(e, "resize-height")}></rect>
                <rect x={this.props.config.blotWidth - 5} y={offset} height={offset + element.height - 5} width={10} fill="transparent" cursor="e-resize"
                    onMouseDown={e => this.beginMouseMove(e, "resize-width")}></rect>
            </>}
        </g>;
    }
}