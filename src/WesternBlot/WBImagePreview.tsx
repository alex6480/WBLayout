import * as React from 'react';
import { App } from '../App';
import { Config } from '../Types/Config';
import { rotateVector, Vector } from '../helpers';
import { IImageObject } from '../Types/IImageObject';
import { WBBlotElement } from '../Types/WBBlotElement';
import { FaHandPaper } from 'react-icons/fa';
import { VscZoomIn, VscZoomOut } from 'react-icons/vsc';

export interface IWBImagePreviewProps
{
    element: WBBlotElement;
    image: IImageObject;
    config: Config;
    updateElement: (element: WBBlotElement) => void;
    updateImage: (image: IImageObject) => void;
}

type actionType = "pan" | "scale-x+" | "scale-y+" | "scale-x-" | "scale-y-" | "scale-x+y+" | "scale-x+y-" | "scale-x-y+" | "scale-x-y-" | "rotate";

export class WBImagePreview extends React.Component<IWBImagePreviewProps, {}>
{
    private svgElement: SVGSVGElement | null = null;
    private grabSize: number = 10;
    private padding: number = 5 * this.grabSize;

    private currentMouseMoveAction?: {
        mouseMoveHandler: (ev: MouseEvent) => void,
        mouseUpHandler: (ev: MouseEvent) => void;
        lastMouseX: number,
        lastMouseY: number,
        initialRotation: number,
        action: actionType;
    } = undefined;

    private beginMouseMove(e: React.MouseEvent<SVGElement>, action: actionType)
    {
        this.currentMouseMoveAction = {
            lastMouseX: e.clientX,
            lastMouseY: e.clientY,
            mouseMoveHandler: this.updatePan.bind(this),
            mouseUpHandler: this.endMouseMove.bind(this),
            initialRotation: this.props.element.boundingBox.rotation,
            action
        };
        window.addEventListener("mousemove", this.currentMouseMoveAction.mouseMoveHandler);
        window.addEventListener("mouseup", this.currentMouseMoveAction.mouseUpHandler);
    }

    private endMouseMove()
    {
        window.removeEventListener("mousemove", this.currentMouseMoveAction.mouseMoveHandler);
        window.removeEventListener("mouseup", this.currentMouseMoveAction.mouseUpHandler);
        this.currentMouseMoveAction = undefined;
    }

    private updatePan(ev: MouseEvent)
    {
        let selectedElement = this.props.element;
        if (this.currentMouseMoveAction === undefined)
        {
            return;
        }
        if (this.currentMouseMoveAction.action === "rotate")
        {
            let scale = this.props.image.zoom / 100;
            let lastRelativeCoords: Vector = {
                a: this.currentMouseMoveAction.lastMouseX - this.svgElement.getBoundingClientRect().left - selectedElement.boundingBox.x * scale - this.padding,
                b: this.currentMouseMoveAction.lastMouseY - this.svgElement.getBoundingClientRect().top - selectedElement.boundingBox.y * scale - this.padding,
            }
            let relativeCoords: Vector = {
                a: ev.clientX - this.svgElement.getBoundingClientRect().left - selectedElement.boundingBox.x * scale - this.padding,
                b: ev.clientY - this.svgElement.getBoundingClientRect().top - selectedElement.boundingBox.y * scale - this.padding,
            }
            let angle = (Math.atan2(relativeCoords.b, relativeCoords.a) - Math.atan2(lastRelativeCoords.b, lastRelativeCoords.a)) * 180 / Math.PI;
            
            this.props.updateElement({ ...selectedElement, boundingBox: { ...selectedElement.boundingBox, rotation: this.currentMouseMoveAction.initialRotation + angle }});
        }
        else
        {
            let updatedElement = { ...selectedElement };
            let mouseDelta: Vector = {
                a: (ev.clientX - this.currentMouseMoveAction.lastMouseX) / this.props.image.zoom * 100,
                b: (ev.clientY - this.currentMouseMoveAction.lastMouseY) / this.props.image.zoom * 100,
            };
            let mouseDeltaTransformed = rotateVector(mouseDelta, -selectedElement.boundingBox.rotation)
            let deltaX = mouseDeltaTransformed.a;
            let deltaY = mouseDeltaTransformed.b;

            let offset: Vector = { a: 0, b: 0 };
            switch (this.currentMouseMoveAction.action)
            {
                case "pan":
                    offset = { a: deltaX, b: deltaY };
                    break;
                case "scale-x+":
                    offset.a = deltaX * 0.5;
                    updatedElement.boundingBox.width = updatedElement.boundingBox.width + deltaX;
                    break;
                case "scale-x-":
                    offset.a = deltaX * 0.5;
                    updatedElement.boundingBox.width = updatedElement.boundingBox.width - deltaX;
                    break;
                case "scale-y+":
                    offset.b = deltaY * 0.5;
                    updatedElement.boundingBox.width = updatedElement.boundingBox.width + deltaY * this.props.config.blotWidth / updatedElement.height;
                    break;
                case "scale-y-":
                    offset.b = deltaY * 0.5;
                    updatedElement.boundingBox.width = updatedElement.boundingBox.width - deltaY * this.props.config.blotWidth / updatedElement.height;
                    break;
                case "scale-x+y+":
                    offset.a = deltaX * 0.5;
                    offset.b = deltaX * updatedElement.height / this.props.config.blotWidth * 0.5;
                    updatedElement.boundingBox.width = updatedElement.boundingBox.width + deltaX;
                    break;
                case "scale-x-y+":
                    offset.a = deltaX * 0.5;
                    offset.b = -deltaX * updatedElement.height / this.props.config.blotWidth * 0.5;
                    updatedElement.boundingBox.width = updatedElement.boundingBox.width - deltaX;
                    break;
                case "scale-x+y-":
                    offset.a = deltaX * 0.5;
                    offset.b = -deltaX * updatedElement.height / this.props.config.blotWidth * 0.5;
                    updatedElement.boundingBox.width = updatedElement.boundingBox.width + deltaX;
                    break;
                case "scale-x-y-":
                    offset.a = deltaX * 0.5;
                    offset.b = deltaX * updatedElement.height / this.props.config.blotWidth * 0.5;
                    updatedElement.boundingBox.width = updatedElement.boundingBox.width - deltaX;
                    break;
            }

            let rotatedOffset = rotateVector(offset, selectedElement.boundingBox.rotation);
            updatedElement.boundingBox.x += rotatedOffset.a;
            updatedElement.boundingBox.y += rotatedOffset.b;

            this.props.updateElement(updatedElement);
            this.currentMouseMoveAction.lastMouseX = ev.clientX;
            this.currentMouseMoveAction.lastMouseY = ev.clientY;
        }
    }

    private zoom(direction: "in" | "out")
    {
        if (this.props.image.name !== "missing")
        {
            this.props.updateImage({ ...this.props.image, zoom: this.props.image.zoom * (direction == "in" ? 1.1 : 1 / 1.1) });
        }
    }

    public render(): JSX.Element
    {
        let element = this.props.element;
        let image = this.props.image;
        let scale = image.zoom / 100;
        let bbHeight = element.height * element.boundingBox.width / this.props.config.blotWidth * scale;
        let bbWidth = element.boundingBox.width * scale;
        let sideSpacing = this.props.config.wellOutsideSpacing * element.boundingBox.width / this.props.config.blotWidth * scale;

        return <>
            <div className="buttons" style={{ justifyContent: "end", padding: "0.5rem", position: "absolute", top: 0, left: 0}}>
                <button className="button" onClick={() => this.zoom("in")}><VscZoomIn /></button>
                <button className="button" onClick={() => this.zoom("out")}><VscZoomOut /></button>
            </div>
            <div style={{ width: "100%", height: "100%", overflow: "scroll"}}>
                <svg ref={e => this.svgElement = e} width={image.size.width * scale + this.padding * 2} height={image.size.height * scale + this.padding * 2}>
                    <g transform={`translate(${image.browserOffset.x + this.padding}, ${image.browserOffset.y + this.padding})`}>
                        <image xlinkHref={image.data} transform={`scale(${scale})`}></image>
                        <g transform={`translate(${element.boundingBox.x * scale},${element.boundingBox.y * scale}),rotate(${element.boundingBox.rotation})`}>
                            { /* Well dividers */}
                            {Array.from(Array(this.props.config.numberOfWells + 1).keys()).map(index => <line key={"well-divicer" + index}
                                x1={-bbWidth * 0.5 + sideSpacing + (bbWidth - sideSpacing * 2) / this.props.config.numberOfWells * index}
                                x2={-bbWidth * 0.5 + sideSpacing + (bbWidth - sideSpacing * 2) / this.props.config.numberOfWells * index}
                                y1={-bbHeight * 0.5} y2={bbHeight * 0.5}
                                strokeWidth={this.props.config.wellSpacing * scale} stroke="red" strokeDasharray="2,2"
                            />)}
                            <rect x={-bbWidth * 0.5} y={-bbHeight * 0.5} height={bbHeight} width={sideSpacing} fill={"rgba(255, 0, 0, 0.3)"}></rect>
                            <rect x={bbWidth * 0.5 - sideSpacing} y={-bbHeight * 0.5} height={bbHeight} width={sideSpacing} fill={"rgba(255, 0, 0, 0.3)"}></rect>
                            
                            { /* Outline */}
                            <rect x={-bbWidth * 0.5} y={-bbHeight * 0.5} height={bbHeight} width={bbWidth}
                                stroke={"red"}
                                strokeWidth={1}
                                fill="transparent"
                                onMouseDown={e => this.beginMouseMove(e, "pan")}
                                style={{ cursor: this.currentMouseMoveAction?.action === "pan" ? 'grabbing' : 'grab' }}></rect>

                            { /* Scale handles */}
                            <rect x={bbWidth * -0.5 - this.grabSize * 0.5} y={this.grabSize * -0.5} height={this.grabSize} width={this.grabSize}
                                fill={"red"}
                                onMouseDown={e => this.beginMouseMove(e, "scale-x-")}
                                style={{ cursor: 'w-resize' }}></rect>
                            <rect x={bbWidth * 0.5 - this.grabSize * 0.5} y={this.grabSize * -0.5} height={this.grabSize} width={this.grabSize}
                                fill={"red"}
                                onMouseDown={e => this.beginMouseMove(e, "scale-x+")}
                                style={{ cursor: 'e-resize' }}></rect>
                            <rect x={this.grabSize * -0.5} y={bbHeight * -0.5 - this.grabSize * 0.5} height={this.grabSize} width={this.grabSize}
                                fill={"red"}
                                onMouseDown={e => this.beginMouseMove(e, "scale-y-")}
                                style={{ cursor: 'n-resize' }}></rect>
                            <rect x={this.grabSize * -0.5} y={bbHeight * 0.5 - this.grabSize * 0.5} height={this.grabSize} width={this.grabSize}
                                fill={"red"}
                                onMouseDown={e => this.beginMouseMove(e, "scale-y+")}
                                style={{ cursor: 's-resize' }}></rect>
                            <rect x={bbWidth * -0.5 - this.grabSize * 0.5} y={bbHeight * -0.5 - this.grabSize * 0.5} height={this.grabSize} width={this.grabSize}
                                fill={"red"}
                                onMouseDown={e => this.beginMouseMove(e, "scale-x-y-")}
                                style={{ cursor: 'nw-resize' }}></rect>
                            <rect x={bbWidth * -0.5 - this.grabSize * 0.5} y={bbHeight * 0.5 - this.grabSize * 0.5} height={this.grabSize} width={this.grabSize}
                                fill={"red"}
                                onMouseDown={e => this.beginMouseMove(e, "scale-x-y+")}
                                style={{ cursor: 'sw-resize' }}></rect>
                            <rect x={bbWidth * 0.5 - this.grabSize * 0.5} y={bbHeight * -0.5 - this.grabSize * 0.5} height={this.grabSize} width={this.grabSize}
                                fill={"red"}
                                onMouseDown={e => this.beginMouseMove(e, "scale-x+y-")}
                                style={{ cursor: 'ne-resize' }}></rect>
                            <rect x={bbWidth * 0.5 - this.grabSize * 0.5} y={bbHeight * 0.5 - this.grabSize * 0.5} height={this.grabSize} width={this.grabSize}
                                fill={"red"}
                                onMouseDown={e => this.beginMouseMove(e, "scale-x+y+")}
                                style={{ cursor: 'se-resize' }}></rect>

                            { /* Rotation handle */}
                            <line x1={0} x2={0} y1={-bbHeight * 0.5} y2={-bbHeight * 0.5 - this.grabSize * 3} strokeWidth={1} stroke="red" />
                            <circle cx={0} cy={-bbHeight * 0.5 - this.grabSize * 3} r={this.grabSize * 0.5}
                                fill="red" style={{ cursor: "pointer" }}
                                onMouseDown={e => this.beginMouseMove(e, "rotate")}
                            />
                        </g>
                    </g>
                </svg>
            </div>
        </>;
    }
}