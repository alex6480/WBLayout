import * as React from 'react';
import { App } from '../App';
import { Config } from '../Config';
import { IImageObject } from '../Types/IImageObject';
import { WBElement } from '../Types/WBElement';
import { WBElementEditor } from './WBElementEditor';

export interface IWBElementListProps
{
    elements: WBElement[];
    config: Config;
    selectedElement?: number;
    images: { [id: number]: IImageObject };
    setImages: (images: {[id: number]: IImageObject }) => void;
    setElements: (elements: WBElement[]) => void;
    updateElement: (element: WBElement, index: number) => void;
    addNewElement: () => void;
}

export class WBElementList extends React.Component<IWBElementListProps, {}>
{
    public render(): JSX.Element
    {
        return <>
            {this.props.elements.map((element, index) => <WBElementEditor
                images={this.props.images}
                key={index}
                elementIndex={index}
                elements={this.props.elements}
                setImages={this.props.setImages}
                updateElement={this.props.updateElement} />)}
            <a className="button" onClick={() => this.props.addNewElement()}>Add element</a>
        </>;
    }
}