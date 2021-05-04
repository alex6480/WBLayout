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
}

interface IWBRendererState
{
    focusedIndex?: number;
    rendering: boolean;
}

export class WBRenderer extends React.Component<IWBRendererProps, IWBRendererState>
{
    private currentlyPanning?: {
        mouseMoveHandler: (ev: MouseEvent) => void,
        mouseUpHandler: (ev: MouseEvent) => void;
        lastMouseX: number,
        lastMouseY: number,
        elementIndex: number
    } = undefined;

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

    private beginPan(e: React.MouseEvent<SVGRectElement>, index: number)
    {
        this.currentlyPanning = {
            lastMouseX: e.screenX,
            lastMouseY: e.screenY,
            elementIndex: index,
            mouseMoveHandler: this.updatePan.bind(this),
            mouseUpHandler: this.endPan.bind(this),
        };
        window.addEventListener("mousemove", this.currentlyPanning.mouseMoveHandler);
        window.addEventListener("mouseup", this.currentlyPanning.mouseUpHandler);
    }

    private endPan()
    {
        window.removeEventListener("mousemove", this.currentlyPanning.mouseMoveHandler);
        window.removeEventListener("mouseup", this.currentlyPanning.mouseUpHandler);
        this.currentlyPanning = undefined;
    }

    private updatePan(ev: MouseEvent)
    {
        if (this.currentlyPanning !== undefined)
        {
            let deltaXUntransformed = ev.screenX - this.currentlyPanning.lastMouseX;
            let deltaYUntransformed = ev.screenY - this.currentlyPanning.lastMouseY;
            let pannedElement = this.props.elements[this.currentlyPanning.elementIndex];
                
            // Rotate the mouse movement vector with the image, so the pan is relative to the rotated image
            let cos = Math.cos(pannedElement.boundingBox.rotation / 180 * Math.PI);
            let sin = Math.sin(pannedElement.boundingBox.rotation / 180 * Math.PI);
            let deltaX = deltaXUntransformed * cos - deltaYUntransformed * sin;
            let deltaY = deltaXUntransformed * sin + deltaYUntransformed * cos;

            this.props.updateElement({
                ...pannedElement,
                boundingBox: {
                    ...pannedElement.boundingBox,
                    x: pannedElement.boundingBox.x - deltaX,
                    y: pannedElement.boundingBox.y - deltaY,
                }
            }, this.currentlyPanning.elementIndex);

            this.currentlyPanning.lastMouseX = ev.screenX;
            this.currentlyPanning.lastMouseY = ev.screenY;
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
                        xlinkHref={this.props.getImage(element.imageIndex).data}></image>
                </g>
                <rect x={strokeWidth * 0.5} y={offset + strokeWidth * 0.5} height={element.height - strokeWidth} width={this.props.config.blotWidth - strokeWidth}
                    stroke={ selected && ! this.state.rendering ? "red" : "black"}
                    strokeWidth={this.props.config.strokeWidth}
                    fill="none"></rect>
                {!this.state.rendering && <rect x={0} y={offset} height={element.height} width={this.props.config.blotWidth}
                    fill="transparent"
                    onMouseEnter={() => this.setState({ focusedIndex: index })}
                    onMouseLeave={() => this.state.focusedIndex === index && this.setState({ focusedIndex: undefined })}
                    onClick={() => this.props.selectElement(index)}
                    onMouseDown={e => selected && this.beginPan(e, index)}
                    style={{ cursor: selected ? (this.currentlyPanning !== undefined ? 'grabbing' : 'grab') : 'pointer' }}></rect>}
                <text y={offset + element.height * 0.5} x={this.props.config.blotWidth + this.props.config.labelSpacing} dominantBaseline="middle">{ element.name }</text>
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