import * as React from 'react';
import { App } from '../App';
import { Config } from '../Config';
import { ImageUploadButton } from '../ImageBrowser';
import { IImageObject } from '../Main';
import { WBElement } from './WBElement';

export interface IWBElementEditorProps
{
    elements: WBElement[];
    elementIndex: number;
    images: { [id: number]: IImageObject };
    updateElement: (element: WBElement, index: number) => void;
    setImages: (images: {[id: number]: IImageObject }) => void;
}

export class WBElementEditor extends React.Component<IWBElementEditorProps, {}>
{
    private AddNewImage(image: IImageObject)
    {
        let key = Object.keys(this.props.images).length > 0 ? Math.max(...Object.keys(this.props.images).map(i => Number(i))) + 1 : 1;
        this.props.setImages({
            ...this.props.images,
            [key]: image
        });
        this.props.updateElement({
            ...this.props.elements[this.props.elementIndex],
            imageIndex: key,
        }, this.props.elementIndex);
    }

    public render(): JSX.Element
    {
        let index = this.props.elementIndex;
        let element = this.props.elements[index];
        return <div>
            <h3 className="title is-4">{element.name}</h3>
            <div className="field">
                <label className="label">Name</label>
                <div className="field">
                    <div className="control">
                        <input className="input" type="text"
                            value={element.name}
                            onChange={(e) => this.props.updateElement({...element, name: e.target.value}, index)} />
                    </div>
                </div>
            </div>
            <div className="field">
                <label className="label">Height</label>
                <div className="field">
                    <div className="control">
                        <input className="input" type="number"
                            value={element.height}
                            onChange={(e) => this.props.updateElement({...element, height: e.target.valueAsNumber}, index)} />
                    </div>
                </div>
            </div>
            <div className="field">
                <label className="label">Image</label>
                <div className="field">
                    <div className="control">
                        { Object.keys(this.props.images).length === 0
                            ? <ImageUploadButton images={this.props.images} addImage={image => this.AddNewImage(image)}>Add image</ImageUploadButton>
                            : <div className="select">
                                <select onChange={(e) => this.props.updateElement({ ...element, imageIndex: Number(e.target.value) }, index)}>
                                    {element.imageIndex === undefined || this.props.images[element.imageIndex] === undefined && <option disabled={true} selected={true}>Select an image</option>}
                                    {Object.keys(this.props.images).map(id => <option value={id} selected={Number(id) === element.imageIndex}>
                                        {this.props.images[Number(id)].name}
                                    </option>)}
                                </select>
                            </div> }
                    </div>
                </div>
            </div>
            <div className="field">
                <label className="label">X</label>
                <div className="field has-addons">
                    <div className="control">
                        <input className="input" type="number"
                            value={element.boundingBox.x}
                            onChange={(e) => this.props.updateElement({ ...element, boundingBox: { ...element.boundingBox, x: e.target.valueAsNumber } }, index)} />
                    </div>
                    <p className="control">
                        <a className="button is-static">
                            px
                        </a>
                    </p>
                </div>
            </div>
            <div className="field">
                <label className="label">Y</label>
                <div className="field has-addons">
                    <div className="control">
                        <input className="input" type="number"
                            value={element.boundingBox.y}
                            onChange={(e) => this.props.updateElement({ ...element, boundingBox: { ...element.boundingBox, y: e.target.valueAsNumber } }, index)} />
                    </div>
                    <p className="control">
                        <a className="button is-static">
                            px
                        </a>
                    </p>
                </div>
            </div>
            <div className="field">
                <label className="label">Width</label>
                <div className="field has-addons">
                    <div className="control">
                        <input className="input" type="number"
                            value={element.boundingBox.width}
                            onChange={(e) => this.props.updateElement({ ...element, boundingBox: { ...element.boundingBox, width: e.target.valueAsNumber } }, index)} />
                    </div>
                    <p className="control">
                        <a className="button is-static">
                            px
                        </a>
                    </p>
                </div>
            </div>
            <div className="field">
                <label className="label">Rotation</label>
                <div className="field has-addons">
                    <div className="control">
                        <input className="input" type="number"
                            value={element.boundingBox.rotation}
                            onChange={(e) => this.props.updateElement({ ...element, boundingBox: { ...element.boundingBox, rotation: e.target.valueAsNumber } }, index)} />
                    </div>
                    <p className="control">
                        <a className="button is-static">
                            °
                        </a>
                    </p>
                </div>
            </div>
        </div>;
    }
}