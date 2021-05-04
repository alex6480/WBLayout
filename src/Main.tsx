import * as React from 'react';
import { App } from './App';
import { TabSet } from './Components/Tabset';
import { Config } from './Config';
import { ConfigEditor } from './ConfigEditor';
import { ImageBrowser } from './ImageBrowser';
import { WBElement } from './WesternBlot/WBElement';
import { WBElementEditor } from './WesternBlot/WBElementEditor';
import { WBElementList } from './WesternBlot/WBElementList';
import { WBImagePreview } from './WesternBlot/WBImagePreview';
import { WBRenderer } from './WesternBlot/WBRenderer';

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
    selectedElementIndex?: number;
}

export interface IImageObject
{
    name: string,
    data: string,
    inverted: boolean,
    size: { width: number, height: number }
}

export class Main extends React.Component<IMainProps, IMainState>
{
    constructor(props: IMainProps) {
        super(props)
        this.state = {
            config: {
                blotWidth: 400,
                numberOfWells: 10,
                spacing: 10,
                strokeWidth: 2,
                labelSpacing: 10,
            },
            images: {},
            elements: [],
            showingImageIndex: undefined
        };
    }

    private addNewElement() {
        this.setState({
            elements: [
                ...this.state.elements,
                {
                    name: "Protein",
                    imageIndex: undefined,
                    height: this.state.config.blotWidth / 5,
                    boundingBox: {
                        x: 0,
                        y: 0,
                        width: this.state.config.blotWidth,
                        rotation: 0,
                    }
                }
            ]});
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
                inverted: false,
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
                                    selectedElementIndex={this.state.selectedElementIndex}
                                    selectElement={id => this.setState({ selectedElementIndex: id })}
                                    updateElement={(element, index) => this.updateElement(element, index)}
                                    addNewElement={() => this.addNewElement()}
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
                            name: "Selected element",
                            content: this.state.selectedElementIndex !== undefined
                                ? < WBElementEditor
                                    elementIndex={this.state.selectedElementIndex}
                                    elements={this.state.elements}
                                    updateElement={(element, index) => this.updateElement(element, index)} />
                                : <div>Select an element to edit it</div>
                        },
                        {
                            name: "Configuration",
                            content: <ConfigEditor config={this.state.config} setConfig={newConf => this.setState({ config: newConf })}/>
                        },
                        {
                            name: "Images",
                            content: <ImageBrowser app={this.props.app}
                                images={this.state.images}
                                setImage={images => this.setImages(images)}
                                viewImage={(index: number) => this.setState({ showingImageIndex: index })}
                                showingImageIndex={this.state.showingImageIndex}/>
                        },
                        {
                            name: "Elements",
                            content: <WBElementList
                                config={this.state.config}
                                elements={this.state.elements}
                                updateElement={(element, index) => this.updateElement(element, index)}
                                setElements={newElements => this.setState({ elements: newElements })}
                                addNewElement={() => this.addNewElement()}/>
                        }
                    ]} />
                </div>
            </div>
        );
    }
}