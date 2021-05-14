import * as React from 'react';
import { App } from './App';
import { TabSet } from './Components/TabSet';
import { Config } from './Types/Config';
import { ConfigEditor } from './Components/ConfigEditor';
import { ImageBrowser } from './ImageBrowser';
import { IImageObject } from './Types/IImageObject';
import { WBBlotElement } from './Types/WBBlotElement';
import { WBBlotElementEditor } from './WesternBlot/Editor/WBBlotElementEditor';
import { WBImagePreview } from './WesternBlot/WBImagePreview';
import { WBRenderer } from './WesternBlot/Renderer/WBRenderer';
import { WBWellLabelElementEditor } from './WesternBlot/Editor/WBWellLabelElementEditor';
import { WBElementEditor } from './WesternBlot/Editor/WBElementEditor';
import UTIF from 'utif';
import { WBWellLabel, WBWellLabelElement } from './Types/WBWellLabel';
import { defaultTextProperties } from './Types/TextProperties';

export interface IMainProps
{
    app: App;
}

interface IMainState
{
    config: Config;
    images: { [id: number]: IImageObject };
    elements: WBElement[];
    showingImageIndex?: number;
    selectedElementIndex: number[];
}

export type WBElement = WBBlotElement | WBWellLabelElement;

export var GetDefaultLabel = function (text: string | number): WBWellLabel
{
    return {
        width: 1,
        underline: false,
        text: text.toString(),
        textProperties: {
            bold: "default",
            italic: "default",
            justification: "default",
            size: "default",
            fontFamily: "default",
        },
        angled: false,
    }
};

export class Main extends React.Component<IMainProps, IMainState>
{
    constructor(props: IMainProps) {
        super(props)

        let numberOfWells = 10;
        this.state = {
            config: {
                blotWidth: 400,
                numberOfWells: numberOfWells,
                elementSpacing: 10,
                strokeWidth: 2,
                elementLabelSpacing: 10,
                wellLabelSpacing: 10,
                wellOutsideSpacing: 0,
                wellSpacing: 10,
                wellLabelAngle: 45,

                defaultTextProperties: { ...defaultTextProperties }
            },
            images: {},
            elements: [
                {
                    type: "well-label",
                    height: 32,
                    labelText: "Label",
                    labels: Array.from(Array(numberOfWells).keys()).map(index => GetDefaultLabel(index + 1)),
                    labelTextProperties: {
                        bold: "default",
                        italic: "default",
                        justification: "start",
                        size: "default",
                        fontFamily: "default",
                    }
                },
            ],
            selectedElementIndex: [],
            showingImageIndex: undefined
        };
    }

    private addNewBlotElement() {
        this.setState({
            elements: [
                ...this.state.elements,
                {
                    type: "blot",
                    label: "Protein",
                    imageIndex: undefined,
                    height: this.state.config.blotWidth / 5,
                    boundingBox: {
                        x: this.state.config.blotWidth * 0.5,
                        y: this.state.config.blotWidth * 0.1,
                        width: this.state.config.blotWidth,
                        rotation: 0,
                    },
                    labelTextProperties: {
                        bold: "default",
                        italic: "default",
                        justification: "default",
                        size: "default",
                        fontFamily: "default",
                    },
                    imageProperties: {
                        brightness: 100,
                        contrast: 100,
                        inverted: false,
                    }
                }
            ]});
    }

    private addNewWellLabelElement() {
        this.setState({
            elements: [{
                type: "well-label",
                height: 32,
                labelText: "Label",
                labels: Array.from(Array(this.state.config.numberOfWells).keys()).map(index => GetDefaultLabel(index + 1)),
                labelTextProperties: {
                    bold: "default",
                    italic: "default",
                    justification: "start",
                    size: "default",
                    fontFamily: "default",
                }
            }, ...this.state.elements],
            selectedElementIndex: this.state.selectedElementIndex.length > 0 ? [this.state.selectedElementIndex[0] + 1, ...this.state.selectedElementIndex.slice(1)] : []
        });
    }

    private setImages(images: { [id: number]: IImageObject })
    {
        this.setState({
            images: images,
            showingImageIndex: this.state.showingImageIndex !== undefined && images[this.state.showingImageIndex] === undefined ? undefined : this.state.showingImageIndex
        });
    }

    private uploadNewImage() : Promise<IImageObject>
    {
        return new Promise(resolve => {
            var inputElement = document.createElement("input");
            inputElement.setAttribute("type", "file");
            document.body.append(inputElement);
            inputElement.onchange = (ev) => {
                if (inputElement.files && inputElement.files.length) {
                    var reader = new FileReader();
                    reader.onload = () => {
                        var dataUrl = reader.result as string;
                        let image = new Image();
                        image.src = dataUrl;

                        if (dataUrl.indexOf("data:image/tiff;") == 0)
                        {
                            let base64_string = dataUrl.substr("data:image/tiff;base64,".length);
                            let binary = Uint8Array.from(atob(base64_string), c => c.charCodeAt(0));
                            let imageDataFiles = UTIF.decode(binary);
                            imageDataFiles.forEach(ifd => UTIF.decodeImage(binary, ifd));
                            let images = imageDataFiles.map(ifd => {
                                var rgba = UTIF.toRGBA8(ifd);
                                var canvas = document.createElement("canvas");
                                canvas.width = ifd.width;
                                canvas.height = ifd.height;
                                var ctx = canvas.getContext("2d");
                                var imgd = new ImageData(new Uint8ClampedArray(rgba.buffer), ifd.width, ifd.height);
                                ctx.putImageData(imgd,0,0);

                                return {
                                    data: canvas.toDataURL(),
                                    name: inputElement.files[0].name,
                                    browserOffset: {x: 0, y: 0},
                                    zoom: 100,
                                    size: {
                                        width: ifd.width,
                                        height: ifd.height
                                    }
                                };
                            });

                            resolve(images[0]);
                        }
                        else
                        {
                            image.onload = () => {
                                resolve({
                                    data: dataUrl,
                                    name: inputElement.files[0].name,
                                    browserOffset: {x: 0, y: 0},
                                    zoom: 100,
                                    size: {
                                        width: image.width,
                                        height: image.height
                                    }
                                });
                            }
                        }
                    };
                    reader.readAsDataURL(inputElement.files[0]);
                }
            }
            inputElement.click();
            document.body.removeChild(inputElement);
        })
    }

    private setConfig(config: Config)
    {
        // Go through all elements and make sure that the labels have the correct number of wells
        for (var elementIndex = 0; elementIndex < this.state.elements.length; elementIndex++)
        {
            let element = this.state.elements[elementIndex];
            if (element.type == "well-label")
            {
                let modified = false;
                let labels = [...element.labels];
                let sumOfWidths = labels.map(label => label.width).reduce((a, b) => a + b, 0);
                while (sumOfWidths < config.numberOfWells)
                {
                    modified = true;
                    labels = [
                        ...labels,
                        GetDefaultLabel(sumOfWidths + 1)
                    ];
                    sumOfWidths = labels.map(label => label.width).reduce((a, b) => a + b, 0);
                }
                while (sumOfWidths > config.numberOfWells)
                {
                    console.log(sumOfWidths, config.numberOfWells);
                    modified = true;
                    let difference = Math.max(0, sumOfWidths - config.numberOfWells);

                    if (difference < labels[labels.length - 1].width)
                    {
                        labels[labels.length - 1].width = labels[labels.length - 1].width - difference;
                    }
                    else
                    {
                        labels = labels.slice(0, labels.length - 1);
                    }

                    sumOfWidths = labels.map(label => label.width).reduce((a, b) => a + b, 0);
                }

                if (modified)
                {
                    this.updateElement({ ...element, labels: labels }, elementIndex);
                }
            }
        }

        this.setState({ config: config });
    }

    private GetImage(index?: number): IImageObject
    {
        if (index === undefined || this.state.images[index] === undefined)
        {
            return {
                data: "",
                name: "missing",
                size: { width: 1000, height: 1000 },
                browserOffset: {x: 0, y: 0},
                zoom: 100
            };
        }
        else
        {
            return this.state.images[index];
        }
    }

    private updateElement(newElement: WBElement, index: number)
    {
        this.setState({
            elements: [
                ...this.state.elements.slice(0, index),
                newElement,
                ...this.state.elements.slice(index + 1)
            ]
        });
    }

    public render(): JSX.Element
    {
        let selectedElement = this.state.selectedElementIndex.length != 0 ? this.state.elements[this.state.selectedElementIndex[0]] : undefined;
        return (
            <div className="columns">
                <div className="column is-two-thirds">
                    {this.state.showingImageIndex != undefined
                        ? <img src={this.state.images[this.state.showingImageIndex].data} />
                        : <div style={{ display: "flex", height: "100vh", flexDirection: "column" }}>
                            <div style={{ flex: "1", padding: "2rem", overflow: "scroll" }}>
                                <WBRenderer
                                    getImage={image => this.GetImage(image)}
                                    images={this.state.images}
                                    config={this.state.config}
                                    elements={this.state.elements}
                                    selectedElementIndex={this.state.selectedElementIndex}
                                    setImages={images => this.setImages(images)}
                                    setElements={newElements => this.setState({ elements: newElements })}
                                    selectElement={id => this.setState({ selectedElementIndex: id })}
                                    updateElement={(element, index) => this.updateElement(element, index)}
                                    addNewBlotElement={() => this.addNewBlotElement()}
                                    addNewWellLabelElement={() => this.addNewWellLabelElement()}
                                    setConfig={newConf => this.setState({ config: newConf })}
                                />
                            </div>
                            {selectedElement !== undefined && selectedElement.type == "blot" && <div style={{flex: "1", position: "relative", height: "50%" }}>
                                <WBImagePreview
                                    element={selectedElement}
                                    image={this.GetImage(selectedElement.imageIndex)}
                                    config={this.state.config}
                                    updateImage={image => selectedElement.type == "blot" && this.setImages({ ...this.state.images, [selectedElement.imageIndex]: image })}
                                    updateElement={element => this.updateElement(element, this.state.selectedElementIndex[0])}
                                />
                            </div> }
                        </div>}
                </div>
                <div className="column is-one-third">
                    <TabSet tabs={[
                        {
                            name: "Current selection",
                            content: this.state.selectedElementIndex.length > 0
                                ? < WBElementEditor
                                    element={selectedElement}
                                    images={this.state.images}
                                    selection={this.state.selectedElementIndex.slice(1)}
                                    setImages={images => this.setImages(images)}
                                    uploadNewImage={() => this.uploadNewImage()}
                                    elementIndex={this.state.selectedElementIndex}
                                    updateElement={(element, index) => this.updateElement(element, index)} />
                                : <div>Select an element to edit it</div>
                        },
                        {
                            name: "Configuration",
                            content: <ConfigEditor config={this.state.config} setConfig={newConf => this.setConfig(newConf)}/>
                        },
                        {
                            name: "Images",
                            content: <ImageBrowser app={this.props.app}
                                uploadNewImage={() => this.uploadNewImage()}
                                images={this.state.images}
                                setImages={images => this.setImages(images)}
                                viewImage={(index: number) => this.setState({ showingImageIndex: index })}
                                showingImageIndex={this.state.showingImageIndex}/>
                        }
                    ]} />
                </div>
            </div>
        );
    }
}