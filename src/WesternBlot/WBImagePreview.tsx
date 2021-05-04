import * as React from 'react';
import { App } from '../App';
import { Config } from '../Config';
import { rotateVector, Vector } from '../helpers';
import { IImageObject } from '../Main';
import { WBElement } from './WBElement';

export interface IWBImagePreviewProps
{
    elements: WBElement[];
    images: { [id: number]: IImageObject }
    selectedElementIndex: number;
    config: Config;
    getImage: (id: number) => IImageObject;
    updateElement: (element: WBElement, index: number) => void;
}

type actionType = "pan" | "scale-x+" | "scale-y+" | "scale-x-" | "scale-y-" | "scale-x+y+" | "scale-x+y-" | "scale-x-y+" | "scale-x-y-" | "rotate";

export class WBImagePreview extends React.Component<IWBImagePreviewProps, {}>
{
    private svgElement: SVGSVGElement | null = null;

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
            initialRotation: this.props.elements[this.props.selectedElementIndex].boundingBox.rotation,
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
        let selectedElement = this.props.elements[this.props.selectedElementIndex];
        if (this.currentMouseMoveAction === undefined)
        {
            return;
        }
        if (this.currentMouseMoveAction.action === "rotate")
        {
            let lastRelativeCoords: Vector = {
                a: this.currentMouseMoveAction.lastMouseX - this.svgElement.getBoundingClientRect().left - selectedElement.boundingBox.x,
                b: this.currentMouseMoveAction.lastMouseY - this.svgElement.getBoundingClientRect().top - selectedElement.boundingBox.y,
            }
            let relativeCoords: Vector = {
                a: ev.clientX - this.svgElement.getBoundingClientRect().left - selectedElement.boundingBox.x,
                b: ev.clientY - this.svgElement.getBoundingClientRect().top - selectedElement.boundingBox.y,
            }
            let angle = (Math.atan2(relativeCoords.b, relativeCoords.a) - Math.atan2(lastRelativeCoords.b, lastRelativeCoords.a)) * 180 / Math.PI;
            
            this.props.updateElement({ ...selectedElement, boundingBox: { ...selectedElement.boundingBox, rotation: this.currentMouseMoveAction.initialRotation + angle }}, this.props.selectedElementIndex);
        }
        else
        {
            let updatedElement = { ...selectedElement };
            let mouseDelta: Vector = {
                a: ev.clientX - this.currentMouseMoveAction.lastMouseX,
                b: ev.clientY - this.currentMouseMoveAction.lastMouseY,
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

            this.props.updateElement(updatedElement, this.props.selectedElementIndex);
            this.currentMouseMoveAction.lastMouseX = ev.clientX;
            this.currentMouseMoveAction.lastMouseY = ev.clientY;
        }
    }

    public render(): JSX.Element
    {
        let element = this.props.elements[this.props.selectedElementIndex];
        let image = this.props.getImage(element.imageIndex);
        let bbHeight = element.height * element.boundingBox.width / this.props.config.blotWidth;
        let grabSize = 10;

        return <svg ref={e => this.svgElement = e} width={image.size.width} height={image.size.height}>
            <image xlinkHref={image.data}></image>
            <g transform={`translate(${element.boundingBox.x},${element.boundingBox.y}),rotate(${element.boundingBox.rotation})`}>
                { /* Outline */ }
                <rect x={-element.boundingBox.width * 0.5} y={-bbHeight * 0.5} height={bbHeight} width={element.boundingBox.width}
                    stroke={ "red" }
                    strokeWidth={1}
                    fill="transparent"
                    onMouseDown={e => this.beginMouseMove(e, "pan")}
                    style={{ cursor: this.currentMouseMoveAction?.action === "pan" ? 'grabbing' : 'grab' }}></rect>
                
                { /* Well dividers */}
                {Array.from(Array(this.props.config.numberOfWells).keys()).map(index => <line key={"well-divicer" + index}
                    x1={-element.boundingBox.width * 0.5 + element.boundingBox.width / this.props.config.numberOfWells * index}
                    x2={-element.boundingBox.width * 0.5 + element.boundingBox.width / this.props.config.numberOfWells * index}
                    y1={-bbHeight * 0.5} y2={bbHeight * 0.5}
                    strokeWidth={1} stroke="red" strokeDasharray="2,2"
                />)}

                { /* Scale handles */ }
                <rect x={element.boundingBox.width * -0.5 - grabSize * 0.5} y={grabSize * -0.5} height={grabSize} width={grabSize}
                    fill={ "red" }
                    onMouseDown={e => this.beginMouseMove(e, "scale-x-")}
                    style={{ cursor: 'w-resize' }}></rect>
                <rect x={element.boundingBox.width * 0.5 - grabSize * 0.5} y={grabSize * -0.5} height={grabSize} width={grabSize}
                    fill={ "red" }
                    onMouseDown={e => this.beginMouseMove(e, "scale-x+")}
                    style={{ cursor: 'e-resize' }}></rect>
                <rect x={grabSize * -0.5} y={bbHeight * -0.5 - grabSize * 0.5} height={grabSize} width={grabSize}
                    fill={ "red" }
                    onMouseDown={e => this.beginMouseMove(e, "scale-y-")}
                    style={{ cursor: 'n-resize' }}></rect>
                <rect x={grabSize * -0.5} y={bbHeight * 0.5 - grabSize * 0.5} height={grabSize} width={grabSize}
                    fill={ "red" }
                    onMouseDown={e => this.beginMouseMove(e, "scale-y+")}
                    style={{ cursor: 's-resize' }}></rect>
                <rect x={element.boundingBox.width * -0.5 - grabSize * 0.5} y={bbHeight * -0.5 - grabSize * 0.5} height={grabSize} width={grabSize}
                    fill={ "red" }
                    onMouseDown={e => this.beginMouseMove(e, "scale-x-y-")}
                    style={{ cursor: 'nw-resize' }}></rect>
                <rect x={element.boundingBox.width * -0.5 - grabSize * 0.5} y={bbHeight * 0.5 - grabSize * 0.5} height={grabSize} width={grabSize}
                    fill={ "red" }
                    onMouseDown={e => this.beginMouseMove(e, "scale-x-y+")}
                    style={{ cursor: 'sw-resize' }}></rect>
                <rect x={element.boundingBox.width * 0.5 - grabSize * 0.5} y={bbHeight * -0.5 - grabSize * 0.5} height={grabSize} width={grabSize}
                    fill={ "red" }
                    onMouseDown={e => this.beginMouseMove(e, "scale-x+y-")}
                    style={{ cursor: 'ne-resize' }}></rect>
                <rect x={element.boundingBox.width * 0.5 - grabSize * 0.5} y={bbHeight * 0.5 - grabSize * 0.5} height={grabSize} width={grabSize}
                    fill={ "red" }
                    onMouseDown={e => this.beginMouseMove(e, "scale-x+y+")}
                    style={{ cursor: 'se-resize' }}></rect>

                { /* Rotation handle */ }
                <line x1={0} x2={0} y1={-bbHeight * 0.5} y2={-bbHeight * 0.5 - grabSize * 3} strokeWidth={1} stroke="red" />
                <circle cx={0} cy={-bbHeight * 0.5 - grabSize * 3} r={grabSize * 0.5}
                    fill="red" style={{ cursor: "pointer" }}
                    onMouseDown={e => this.beginMouseMove(e, "rotate")}
                />
            </g>
        </svg>;
    }
}