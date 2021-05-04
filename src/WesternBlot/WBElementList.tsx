import * as React from 'react';
import { App } from '../App';
import { Config } from '../Config';
import { IImageObject } from '../Main';
import { WBElement } from './WBElement';
import { WBElementEditor } from './WBElementEditor';

export interface IWBElementListProps
{
    elements: WBElement[];
    config: Config;
    selectedElement?: number;
    setElements: (elements: WBElement[]) => void;
    updateElement: (element: WBElement, index: number) => void;
    addNewElement: () => void;
}

export class WBElementList extends React.Component<IWBElementListProps, {}>
{
    public render(): JSX.Element
    {
        return <>
            {this.props.elements.map((element, index) => <WBElementEditor key={index} elementIndex={index} elements={this.props.elements} updateElement={this.props.updateElement} />)}
            <a className="button" onClick={() => this.props.addNewElement()}>Add element</a>
        </>;
    }
}