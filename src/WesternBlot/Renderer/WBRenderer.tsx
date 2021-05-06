import * as React from 'react';
import { App } from '../../App';
import { Config } from '../../Types/Config';
import { IImageObject } from '../../Types/IImageObject';
import { WBElement } from '../../Types/WBElement';
import { WBElementRenderer } from './WBElementRenderer';
import { WBWellLabelRowRenderer } from './WBWellLabelRowRenderer';

export interface IWBRendererProps
{
    config: Config;
    setConfig: (config: Config) => void;

    elements: WBElement[];
    selectedElementIndex: number;
    selectElement: (id: number) => void;
    updateElement: (element: WBElement, index: number) => void;
    addNewElement: () => void;
    setElements: (elements: WBElement[]) => void;

    wellLabels: WBWellLabelRow[];
    selectedLabelRowIndex: number;
    selectLabelRow: (index: number) => void;
    addNewLabelRow: () => void;
    updateLabelRow: (labelRow: WBWellLabelRow, index: number) => void;

    images: { [id: number]: IImageObject };
    setImages: (images: { [id: number]: IImageObject }) => void;
    getImage: (id: number) => IImageObject;
}

interface IWBRendererState
{
    focusedIndex?: number;
    rendering: boolean;
    embedImages: boolean;
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
    private svgDataStart: string = "<!-- <DATA>";
    private svgDataEnd: string = "</DATA> -->";

    constructor(props: IWBRendererProps)
    {
        super(props);
        this.state = {
            rendering: false,
            embedImages: true,
        };
    }

    private saveSvg() {
        let embedImages = false;
        // Make a copy of the application state
        let data = JSON.parse(JSON.stringify({ config: this.props.config, images: this.props.images, elements: this.props.elements }));
        // Remove image data from the data array
        Object.keys(data.images).map(key => delete (data.images[key] as IImageObject).data);

        this.setState({
            rendering: true,
            embedImages: embedImages
        }, () => {
            let svgEl = this.svgElement;

            svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
            svgEl.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
            var svgData = svgEl.outerHTML;
            var preface = '<?xml version="1.0" standalone="no"?>\r\n';
            var comment = this.svgDataStart + JSON.stringify(data) + this.svgDataEnd;
            var svgBlob = new Blob([preface, comment, svgData], { type: "image/svg+xml;charset=utf-8" });
            var svgUrl = URL.createObjectURL(svgBlob);
            var downloadLink = document.createElement("a");
            downloadLink.href = svgUrl;
            downloadLink.download = "WesternBlot.svg";
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

            this.setState({
                rendering: false,
                embedImages: true
            });
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

    private loadFile()
    {
        var inputElement = document.createElement("input");
        inputElement.setAttribute("type", "file");
        document.body.append(inputElement);
        inputElement.onchange = (ev) => {
            if (inputElement.files && inputElement.files.length) {
                var reader = new FileReader();
                reader.onload = () => {
                    var svgContents = reader.result as string;
                    var startIndex = svgContents.indexOf(this.svgDataStart) + this.svgDataStart.length;
                    var endIndex = svgContents.indexOf(this.svgDataEnd, startIndex) - startIndex;
                    var dataString = svgContents.substr(startIndex, endIndex);
                    let data = JSON.parse(dataString);

                    // Try to load the data for the images if it has been embedded
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(svgContents, "image/svg+xml");

                    let missingImages = false;
                    Object.keys(data.images).map(key => {
                        let image = doc.getElementById("image-" + key);
                        if (image && image.getAttribute("xlink:href").indexOf("data:") == 0)
                        {
                            (data.images[key] as IImageObject).data = image.getAttribute("xlink:href");
                        }
                        else
                        {
                            missingImages = true;
                        }
                    });

                    if (missingImages)
                    {
                        alert("Some images are missing and need to be uploaded manually on the images tab");
                    }

                    this.props.setConfig(data.config);
                    this.props.setElements(data.elements);
                    this.props.setImages(data.images);
                };
                reader.readAsText(inputElement.files[0]);
            }
        }
        inputElement.click();
        document.body.removeChild(inputElement);
    }

    public render(): JSX.Element
    {
        let strokeWidth = this.props.config.strokeWidth;
        let offset = 20;

        let editorLayer: JSX.Element[] = [];

        // Render the well labels
        let wellLabels = this.props.wellLabels.map((row, rowIndex) => {
            let selected = this.props.selectedLabelRowIndex === rowIndex;
            offset += row.height;

            if (selected)
            {
                // Add editable text field for the row label
                editorLayer.push(<input type="text"
                    key={"well-label-editor-" + rowIndex}
                    value={row.labelText}
                    onChange={ev => this.props.updateLabelRow({ ...row, labelText: ev.target.value }, rowIndex)}
                    className="borderless-input"
                    style={{
                        color: "red",
                        position: "absolute",
                        left: `${this.props.config.blotWidth + this.props.config.elementLabelSpacing}px`,
                        top: `calc(${offset - this.props.config.wellLabelSpacing - 5}px - 1.1em)`,
                        height: "1.4em",
                        width: this.props.config.blotWidth,
                    }}
                />);
                
                // Add editable text fields for the well labels
                let currentPosition = 0;
                let labelRowWidth = (this.props.config.blotWidth - this.props.config.wellOutsideSpacing * 2);
                row.labels.map((label, labelIndex) => {
                    editorLayer.push(<input type="text"
                        key={"well-label-editor-" + rowIndex + "-" + labelIndex}
                        value={label.text}
                        onChange={ev => this.props.updateLabelRow({
                            ...row,
                            labels: [
                                ...row.labels.slice(0, labelIndex),
                                {
                                    ...row.labels[labelIndex],
                                    text: ev.target.value
                                },
                                ...row.labels.slice(labelIndex + 1)
                            ]
                        }, rowIndex)}
                        className="borderless-input"
                        style={{
                            color: "red",
                            position: "absolute",
                            left: `${this.props.config.wellOutsideSpacing + labelRowWidth / this.props.config.numberOfWells * currentPosition + this.props.config.wellSpacing * 0.5}px`,
                            top: `calc(${offset - this.props.config.wellLabelSpacing - 5}px - 1.1em)`,
                            height: "1.4em",
                            width: labelRowWidth / this.props.config.numberOfWells * label.width - this.props.config.wellSpacing,
                            textAlign: label.justification == "middle" ? "center" : label.justification
                        }}
                    />);
                    currentPosition += label.width;
                })
            }

            return <WBWellLabelRowRenderer
                key={"well-label-row-" + rowIndex}
                config={this.props.config}
                labelRow={row}
                offset={offset}
                onChange={row => this.props.updateLabelRow(row, rowIndex)}
                rendering={this.state.rendering}
                select={() => this.props.selectLabelRow(rowIndex)}
                selected={selected}
            />
        });

        // Render element components
        let elementComponents = this.props.elements.map((element, index) => {
            let selected = this.props.selectedElementIndex === index;
            let result = <WBElementRenderer
                key={"blot-element-" + index}
                config={this.props.config}
                element={element}
                embedImages={this.state.embedImages}
                image={this.props.getImage(element.imageIndex)}
                index={index}
                offset={offset}
                onChange={element => this.props.updateElement(element, index)}
                rendering={this.state.rendering}
                select={() => this.props.selectElement(index)}
                selected={selected}
                setConfig={this.props.setConfig}
            />;

            if (selected)
            {
                // Add editable text field
                editorLayer.push(<input type="text"
                    key={"label-editor-" + index}
                    value={element.label}
                    onChange={ev => this.props.updateElement({ ...element, label: ev.target.value }, index)}
                    className="borderless-input"
                    style={{
                        color: "red",
                        position: "absolute",
                        left: `${this.props.config.blotWidth + this.props.config.elementLabelSpacing}px`,
                        top: `calc(${offset + element.height * 0.5}px - 1em)`,
                        height: "2em",
                        width: this.props.config.blotWidth - this.props.config.elementLabelSpacing
                    }}
                />);
            }

            offset += element.height + this.props.config.elementSpacing;
            return result;
        });

        return <>
            <div className="buttons">
                <a className="button" onClick={() => this.props.addNewElement()}>Add element</a>
                <a className="button" onClick={() => this.props.addNewLabelRow()}>Add Label</a>
                <a className="button" onClick={() => this.saveSvg()}>Download SVG</a>
                <a className="button" onClick={() => this.loadFile()}>Load</a>
            </div>
            <div style={{position: 'relative', fontSize: "1rem"}}>
                <svg ref={e => this.svgElement = e} width={this.props.config.blotWidth * 2} height={offset + 100}>
                    { /* Render well labels */}
                    {wellLabels}
                    
                    { /* Render the elements */ }
                    {elementComponents}
                </svg>
                {editorLayer}
            </div>
        </>;
    }
}