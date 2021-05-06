import * as React from 'react';
import { App } from '../../App';
import { Config } from '../../Types/Config';
import { ImageUploadButton } from '../../ImageBrowser';
import { IImageObject } from '../../Types/IImageObject';
import { WBBlotElement } from '../../Types/WBBlotElement';
import { WBElement } from '../../Main';
import { WBBlotElementEditor } from './WBBlotElementEditor';
import { WBWellLabelEditor } from './WBWellLabelEditor';
import { WBWellLabelElementEditor as WBWellLabelElementEditor } from './WBWellLabelElementEditor';

export interface IWBElementEditorProps
{
    element: WBElement;
    elementIndex: number;
    images: { [id: number]: IImageObject };
    updateElement: (element: WBElement, index: number) => void;
    setImages: (images: {[id: number]: IImageObject }) => void;
}

export class WBElementEditor extends React.Component<IWBElementEditorProps, {}>
{
    public render(): JSX.Element
    {
        let element = this.props.element;
        if (element.type == "blot")
        {
            return <WBBlotElementEditor
                element={element}
                images={this.props.images}
                onChange={element => this.props.updateElement(element, this.props.elementIndex)}
                setImages={this.props.setImages}
            />;
        }
        else if (element.type == "well-label")
        {
            return <WBWellLabelElementEditor
                element={element}
                onChange={element => this.props.updateElement(element, this.props.elementIndex)}
            />;
        }
    }
}