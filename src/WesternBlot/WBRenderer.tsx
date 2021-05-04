import * as React from 'react';
import { App } from '../App';
import { Config } from '../Config';
import { IImageObject } from '../Main';
import { WBElement } from './WBElement';

export interface IWBRendererProps
{
    elements: WBElement[];
    selectedElementIndex: number;
    images: { [id: number]: IImageObject }
    getImage: (id: number) => IImageObject;
    config: Config;
    selectElement: (id: number) => void;
    updateElement: (element: WBElement, index: number) => void;
    addNewElement: () => void;
    setConfig: (config: Config) => void;
}

interface IWBRendererState
{
    focusedIndex?: number;
    rendering: boolean;
    mouseMoveAction?: MouseMoveAction;
}

type MouseMoveActionType = "pan" | "resize-height" | "resize-width";
type MouseMoveAction = {
    mouseMoveHandler: (ev: MouseEvent) => void,
    mouseUpHandler: (ev: MouseEvent) => void;
    lastMouseX: number,
    lastMouseY: number,
    elementIndex: number,
    type: MouseMoveActionType
};

export class WBRenderer extends React.Component<IWBRendererProps, IWBRendererState>
{
    private svgElement: SVGSVGElement | null = null;

    constructor(props: IWBRendererProps)
    {
        super(props);
        this.state = {
            rendering: false,
        };
    }

    private saveSvg() {
        this.setState({ rendering: true }, () => {
            let svgEl = this.svgElement;

            svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
            svgEl.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
            var svgData = svgEl.outerHTML;
            var preface = '<?xml version="1.0" standalone="no"?>\r\n';
            var svgBlob = new Blob([preface, svgData], { type: "image/svg+xml;charset=utf-8" });
            var svgUrl = URL.createObjectURL(svgBlob);
            var downloadLink = document.createElement("a");
            downloadLink.href = svgUrl;
            downloadLink.download = "WesternBlot.svg";
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

            this.setState({ rendering: false });
        });
    }

    private beginMouseMove(e: React.MouseEvent<SVGRectElement>, index: number, action: MouseMoveActionType)
    {
        let mouseMoveHandler = this.updateMouseMove.bind(this);
        let mouseUpHandler = this.endMouseMove.bind(this);
        window.addEventListener("mousemove", mouseMoveHandler);
        window.addEventListener("mouseup", mouseUpHandler);
        this.setState({
            mouseMoveAction: {
                lastMouseX: e.screenX,
                lastMouseY: e.screenY,
                elementIndex: index,
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
            let pannedElement = this.props.elements[this.state.mouseMoveAction.elementIndex];
                
            // Rotate the mouse movement vector with the image, so the pan is relative to the rotated image
            let cos = Math.cos(pannedElement.boundingBox.rotation / 180 * Math.PI);
            let sin = Math.sin(pannedElement.boundingBox.rotation / 180 * Math.PI);
            let deltaX = deltaXUntransformed * cos - deltaYUntransformed * sin;
            let deltaY = deltaXUntransformed * sin + deltaYUntransformed * cos;

            if (this.state.mouseMoveAction.type === "pan")
            {
                this.props.updateElement({
                    ...pannedElement,
                    boundingBox: {
                        ...pannedElement.boundingBox,
                        x: pannedElement.boundingBox.x - deltaX,
                        y: pannedElement.boundingBox.y - deltaY,
                    }
                }, this.state.mouseMoveAction.elementIndex);
            }
            else if (this.state.mouseMoveAction.type === "resize-height")
            {
                this.props.updateElement({
                    ...pannedElement,
                    height: pannedElement.height + deltaYUntransformed,
                }, this.state.mouseMoveAction.elementIndex);
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
        let offset = 0;
        let elementComponents = this.props.elements.map((element, index) => {
            let selected = this.props.selectedElementIndex === index;
            let imageScale = this.props.config.blotWidth / element.boundingBox.width;
            let result = <g key={index}>
                { /* Render the image with clipping */}
                <clipPath id={"element-image-clip-" + index}>
                    <rect x="0" y={offset} height={element.height} width={this.props.config.blotWidth}></rect>
                </clipPath>
                <g style={{ clipPath: "url(#element-image-clip-" + index + ")" }}>
                    <image
                        width={this.props.getImage(element.imageIndex).size.width}
                        height={this.props.getImage(element.imageIndex).size.height}
                        transform={`scale(${imageScale}),` +
                            `translate(${element.boundingBox.width * 0.5}, ${(element.height * 0.5 + offset) / imageScale}),` +
                            `rotate(${-element.boundingBox.rotation})` +
                            `translate(${-element.boundingBox.x}, ${-element.boundingBox.y})`}
                        style={{ filter: `invert(${element.imageProperties.inverted ? 1 : 0}) brightness(${element.imageProperties.brightness}%) contrast(${element.imageProperties.contrast}%)`}}
                        xlinkHref={this.state.rendering ? this.props.getImage(element.imageIndex).name : this.props.getImage(element.imageIndex).data}></image>
                </g>

                { /* Render the outline */}
                <rect x={strokeWidth * 0.5} y={offset + strokeWidth * 0.5} height={element.height - strokeWidth} width={this.props.config.blotWidth - strokeWidth}
                    stroke={ selected && ! this.state.rendering ? "red" : "black"}
                    strokeWidth={this.props.config.strokeWidth}
                    fill="none"></rect>
                {!this.state.rendering && <rect x={0} y={offset} height={element.height} width={this.props.config.blotWidth}
                    fill="transparent"
                    onMouseEnter={() => this.setState({ focusedIndex: index })}
                    onMouseLeave={() => this.state.focusedIndex === index && this.setState({ focusedIndex: undefined })}
                    onClick={() => this.props.selectElement(index)}
                    onMouseDown={e => selected && this.beginMouseMove(e, index, "pan")}
                    style={{ cursor: selected ? (this.state.mouseMoveAction !== undefined ? 'grabbing' : 'grab') : 'pointer' }}></rect>}
                
                { /* Render the label */}
                <text y={offset + element.height * 0.5} x={this.props.config.blotWidth + this.props.config.labelSpacing} dominantBaseline="middle">{element.label}</text>
                
                { /* Render editor utilities */}
                { ! this.state.rendering && <>
                    <rect x={0} y={offset + element.height - 5} height={10} width={this.props.config.blotWidth} fill="transparent" cursor="s-resize"
                        onMouseDown={e => this.beginMouseMove(e, index, "resize-height")}></rect>
                    <rect x={this.props.config.blotWidth - 5} y={offset} height={offset + element.height - 5} width={10} fill="transparent" cursor="e-resize"
                        onMouseDown={e => this.beginMouseMove(e, index, "resize-width")}></rect>
                </>}
            </g>;
            
            offset += element.height + this.props.config.spacing;
            
            return result;
        });
        return <>
            <div className="buttons">
                <a className="button" onClick={() => this.props.addNewElement()}>Add element</a>
                <a className="button" onClick={() => this.saveSvg()}>Download SVG</a>
                <a className="button">Download editor file</a>
            </div>
            <svg ref={e => this.svgElement = e} width={this.props.config.blotWidth * 2 + 2000} height={offset + 2000}>{elementComponents}</svg>
        </>;
    }
}