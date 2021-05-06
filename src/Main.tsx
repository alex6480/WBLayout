import * as React from 'react';
import { App } from './App';
import { TabSet } from './Components/TabSet';
import { Config } from './Types/Config';
import { ConfigEditor } from './ConfigEditor';
import { ImageBrowser } from './ImageBrowser';
import { IImageObject } from './Types/IImageObject';
import { WBElement } from './Types/WBElement';
import { WBElementEditor } from './WesternBlot/WBElementEditor';
import { WBElementList } from './WesternBlot/WBElementList';
import { WBImagePreview } from './WesternBlot/WBImagePreview';
import { WBRenderer } from './WesternBlot/Renderer/WBRenderer';
import { WBWellLabelRowEditor } from './WesternBlot/WBWellLabelRowEditor';

export interface IMainProps
{
    app: App;
}

interface IMainState
{
    config: Config;
    images: { [id: number]: IImageObject };
    elements: WBElement[];
    wellLabels: WBWellLabelRow[];
    showingImageIndex?: number;
    selectedElementIndex?: number;
    selectedLabelRowIndex?: number;
}

export var GetDefaultLabel = function (text: string | number): WBWellLabel
{
    return {
        width: 1,
        underline: false,
        text: text.toString(),
        justification: "middle",
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
            },
            images: {},
            elements: [],
            wellLabels: [{
                height: 50,
                labelText: "Label",
                labels: Array.from(Array(numberOfWells).keys()).map(index => GetDefaultLabel(index))
            }],
            showingImageIndex: undefined
        };
    }

    private addNewElement() {
        this.setState({
            elements: [
                ...this.state.elements,
                {
                    label: "Protein",
                    imageIndex: undefined,
                    height: this.state.config.blotWidth / 5,
                    boundingBox: {
                        x: this.state.config.blotWidth * 0.5,
                        y: this.state.config.blotWidth * 0.1,
                        width: this.state.config.blotWidth,
                        rotation: 0,
                    },
                    imageProperties: {
                        brightness: 100,
                        contrast: 100,
                        inverted: false,
                    }
                }
            ]});
    }

    private addNewLabelRow() {
        this.setState({
            wellLabels: [{
                height: 32,
                labelText: "Label",
                labels: Array.from(Array(this.state.config.numberOfWells).keys()).map(index => GetDefaultLabel(index))
            }, ...this.state.wellLabels]
        });
    }

    private setImages(images: { [id: number]: IImageObject })
    {
        this.setState({
            images: images,
            showingImageIndex: this.state.showingImageIndex !== undefined && images[this.state.showingImageIndex] === undefined ? undefined : this.state.showingImageIndex
        });
    }

    private GetImage(index?: number): IImageObject
    {
        if (index === undefined || this.state.images[index] === undefined)
        {
            return {
                data: "",
                name: "Missing image",
                size: { width: 1000, height: 1000 }
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

    private updateWellLabelRow(newRow: WBWellLabelRow, index: number)
    {
        this.setState({
            wellLabels: [
                ...this.state.wellLabels.slice(0, index),
                newRow,
                ...this.state.wellLabels.slice(index + 1)
            ]
        });
    }

    public render(): JSX.Element
    {
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
                                    wellLabels={this.state.wellLabels}
                                    selectedElementIndex={this.state.selectedElementIndex}
                                    selectedLabelRowIndex={this.state.selectedLabelRowIndex}
                                    setImages={images => this.setImages(images)}
                                    setElements={newElements => this.setState({ elements: newElements })}
                                    selectElement={id => this.setState({ selectedElementIndex: id, selectedLabelRowIndex: undefined })}
                                    updateElement={(element, index) => this.updateElement(element, index)}
                                    addNewElement={() => this.addNewElement()}
                                    addNewLabelRow={() => this.addNewLabelRow()}
                                    updateLabelRow={(row, index) => this.updateWellLabelRow(row, index)}
                                    selectLabelRow={index => this.setState({ selectedElementIndex: undefined, selectedLabelRowIndex: index })}
                                    setConfig={newConf => this.setState({ config: newConf })}
                                />
                            </div>
                            { this.state.selectedElementIndex !== undefined && <div style={{flex: "1", overflow: "scroll"}}>
                                <WBImagePreview elements={this.state.elements}
                                    selectedElementIndex={this.state.selectedElementIndex}
                                    getImage={image => this.GetImage(image)}
                                    images={this.state.images}
                                    config={this.state.config}
                                    updateElement={(element, index) => this.updateElement(element, index)}
                                />
                            </div> }
                        </div>}
                </div>
                <div className="column is-one-third">
                    <TabSet tabs={[
                        {
                            name: "Current selection",
                            content: this.state.selectedElementIndex !== undefined
                                ? < WBElementEditor
                                    images={this.state.images}
                                    setImages={images => this.setImages(images)}
                                    elementIndex={this.state.selectedElementIndex}
                                    elements={this.state.elements}
                                    updateElement={(element, index) => this.updateElement(element, index)} />
                                : (this.state.selectedLabelRowIndex !== undefined
                                    ? <WBWellLabelRowEditor
                                        onChange={row => this.updateWellLabelRow(row, this.state.selectedLabelRowIndex)}
                                        row={this.state.wellLabels[this.state.selectedLabelRowIndex]}
                                    />
                                    : <div>Select an element to edit it</div>)
                        },
                        {
                            name: "Configuration",
                            content: <ConfigEditor config={this.state.config} setConfig={newConf => this.setState({ config: newConf })}/>
                        },
                        {
                            name: "Images",
                            content: <ImageBrowser app={this.props.app}
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