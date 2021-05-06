import * as React from 'react';
import { App } from '../../App';
import { WBElement } from '../../Main';
import { Config } from '../../Types/Config';
import { IImageObject } from '../../Types/IImageObject';
import { WBBlotElement } from '../../Types/WBBlotElement';
import { ReorderRenderer } from './ReorderRenderer';
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
    addNewBlotElement: () => void;
    addNewWellLabelElement: () => void;
    setElements: (elements: WBElement[]) => void;

    images: { [id: number]: IImageObject };
    setImages: (images: { [id: number]: IImageObject }) => void;
    getImage: (id: number) => IImageObject;
}

interface IWBRendererState
{
    focusedIndex?: number;
    rendering: boolean;
    embedImages: boolean;
}

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
        let embedImages = true;
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
        let offset = 20;

        let editorLayer: JSX.Element[] = [];

        // Render the elements
        let selectedElementPosition: number | undefined = undefined;
        let elements = this.props.elements.map((element, elementIndex) => {
            let selected = this.props.selectedElementIndex === elementIndex;

            if (element.type === "well-label")
            {
                if (selected)
                {
                    selectedElementPosition = offset + element.height * 0.5;

                    // Add editable text field for the row label
                    editorLayer.push(<input type="text"
                        key={"well-label-editor-" + elementIndex}
                        value={element.labelText}
                        onChange={ev => this.props.updateElement({ ...element, labelText: ev.target.value }, elementIndex)}
                        className="borderless-input"
                        style={{
                            color: "red",
                            position: "absolute",
                            left: `${this.props.config.blotWidth + this.props.config.elementLabelSpacing + 100}px`,
                            top: `calc(${offset - 10 + element.height}px - 1.1em)`,
                            height: "1.4em",
                            width: this.props.config.blotWidth,
                        }}
                    />);
                    
                    // Add editable text fields for the well labels
                    let currentPosition = 0;
                    let labelRowWidth = (this.props.config.blotWidth - this.props.config.wellOutsideSpacing * 2);
                    element.labels.map((label, labelIndex) => {
                        editorLayer.push(<input type="text"
                            key={"well-label-editor-" + elementIndex + "-" + labelIndex}
                            value={label.text}
                            onChange={ev => this.props.updateElement({
                                ...element,
                                labels: [
                                    ...element.labels.slice(0, labelIndex),
                                    {
                                        ...element.labels[labelIndex],
                                        text: ev.target.value
                                    },
                                    ...element.labels.slice(labelIndex + 1)
                                ]
                            }, elementIndex)}
                            className="borderless-input"
                            style={{
                                color: "red",
                                position: "absolute",
                                left: `${this.props.config.wellOutsideSpacing + labelRowWidth / this.props.config.numberOfWells * currentPosition + this.props.config.wellSpacing * 0.5 + 100}px`,
                                top: `calc(${offset - 10 + element.height}px - 1.1em)`,
                                height: "1.4em",
                                width: labelRowWidth / this.props.config.numberOfWells * label.width - this.props.config.wellSpacing,
                                textAlign: label.justification == "middle" ? "center" : label.justification
                            }}
                        />);
                        currentPosition += label.width;
                    })
                }

                let result = <WBWellLabelRowRenderer
                    key={"well-label-row-" + elementIndex}
                    config={this.props.config}
                    labelRow={element}
                    offset={offset}
                    onChange={row => this.props.updateElement(row, elementIndex)}
                    rendering={this.state.rendering}
                    select={() => this.props.selectElement(elementIndex)}
                    selected={selected}
                />

                offset += element.height + this.props.config.wellLabelSpacing;

                return result;
            }
            else if (element.type == "blot")
            {
                let result = <WBElementRenderer
                    key={"blot-element-" + elementIndex}
                    config={this.props.config}
                    element={element}
                    embedImages={this.state.embedImages}
                    image={this.props.getImage(element.imageIndex)}
                    index={elementIndex}
                    offset={offset}
                    onChange={element => this.props.updateElement(element, elementIndex)}
                    rendering={this.state.rendering}
                    select={() => this.props.selectElement(elementIndex)}
                    selected={selected}
                    setConfig={this.props.setConfig}
                />;

                if (selected)
                {
                    selectedElementPosition = offset + element.height * 0.5;

                    // Add editable text field
                    editorLayer.push(<input type="text"
                        key={"label-editor-" + elementIndex}
                        value={element.label}
                        onChange={ev => this.props.updateElement({ ...element, label: ev.target.value }, elementIndex)}
                        className="borderless-input"
                        style={{
                            color: "red",
                            position: "absolute",
                            left: `${this.props.config.blotWidth + this.props.config.elementLabelSpacing + 100}px`,
                            top: `calc(${offset + element.height * 0.5}px - 1em)`,
                            height: "2em",
                            width: this.props.config.blotWidth - this.props.config.elementLabelSpacing
                        }}
                    />);
                }

                offset += element.height + this.props.config.elementSpacing;
                return result;
            }
        });

        return <>
            <div className="buttons">
                <a className="button" onClick={() => this.props.addNewBlotElement()}>Add element</a>
                <a className="button" onClick={() => this.props.addNewWellLabelElement()}>Add Label</a>
                <a className="button" onClick={() => this.saveSvg()}>Download SVG</a>
                <a className="button" onClick={() => this.loadFile()}>Load</a>
            </div>
            <div style={{position: 'relative', fontSize: "1rem"}}>
                <svg ref={e => this.svgElement = e} width={this.props.config.blotWidth * 2 + (this.state.rendering ? 100 : 0)} height={offset + 100}>
                    {this.state.rendering
                        ? elements
                        : <g transform="translate(100, 0)">
                            {elements}
                            { selectedElementPosition !== undefined && <ReorderRenderer
                                x={-20} y={selectedElementPosition}
                                canUp={this.props.selectedElementIndex != 0}
                                onUp={() => {
                                    this.props.setElements([
                                        ...this.props.elements.slice(0, this.props.selectedElementIndex - 1),
                                        this.props.elements[this.props.selectedElementIndex],
                                        this.props.elements[this.props.selectedElementIndex - 1],
                                        ...this.props.elements.slice(this.props.selectedElementIndex + 1),
                                    ]);
                                    this.props.selectElement(this.props.selectedElementIndex - 1);
                                }}
                                canDown={this.props.selectedElementIndex < this.props.elements.length - 1}
                                onDown={() => {
                                    this.props.setElements([
                                        ...this.props.elements.slice(0, this.props.selectedElementIndex),
                                        this.props.elements[this.props.selectedElementIndex + 1],
                                        this.props.elements[this.props.selectedElementIndex],
                                        ...this.props.elements.slice(this.props.selectedElementIndex + 2),
                                    ]);
                                    this.props.selectElement(this.props.selectedElementIndex + 1);
                                }}
                            />}
                        </g>}
                </svg>
                {editorLayer}
            </div>
        </>;
    }
}