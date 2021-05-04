import * as React from 'react';
import { App } from '../App';
import { Config } from '../Types/Config';
import { ImageUploadButton } from '../ImageBrowser';
import { IImageObject } from '../Types/IImageObject';
import { WBElement } from '../Types/WBElement';

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
            <h3 className="title is-4">General</h3>
            <div className="field">
                <label className="label">Label</label>
                <div className="field">
                    <div className="control">
                        <input className="input" type="text"
                            value={element.label}
                            onChange={(e) => this.props.updateElement({...element, label: e.target.value}, index)} />
                    </div>
                </div>
            </div>

            <h3 className="title is-4">Image</h3>
            <div className="field">
                <label className="label">Image</label>
                <div className="field">
                    <div className="control">
                        { Object.keys(this.props.images).length === 0
                            ? <ImageUploadButton images={this.props.images} addImage={image => this.AddNewImage(image)}>Add image</ImageUploadButton>
                            : <div className="select">
                                <select onChange={(e) => this.props.updateElement({ ...element, imageIndex: e.target.value !== "no-image" ? Number(e.target.value) : undefined }, index)}
                                    value={element.imageIndex === undefined || this.props.images[element.imageIndex] === undefined ? "no-image" : element.imageIndex}>
                                    {<option key="no-image" value="no-image" disabled={true}>Select an image</option>}
                                    {Object.keys(this.props.images).map(id => <option key={id} value={id}>
                                        {this.props.images[Number(id)].name}
                                    </option>)}
                                </select>
                            </div> }
                    </div>
                </div>
            </div>
            <div className="field">
                <label className="checkbox">
                    <input type="checkbox" onChange={e => this.props.updateElement({
                        ...element, imageProperties: { ...element.imageProperties, inverted: ! element.imageProperties.inverted }
                    }, index)}
                        checked={element.imageProperties.inverted}/>
                    Inverted
                </label>
            </div>
            <div className="field">
                <label className="label">Brightness</label>
                <div className="field has-addons">
                    <div className="control">
                        <input className="input" type="number"
                            value={element.imageProperties.brightness}
                            onChange={(e) => this.props.updateElement({ ...element, imageProperties: { ...element.imageProperties, brightness: e.target.valueAsNumber } }, index)} />
                    </div>
                    <p className="control">
                        <a className="button is-static">
                            %
                        </a>
                    </p>
                </div>
            </div>
            <div className="field">
                <label className="label">Contrast</label>
                <div className="field has-addons">
                    <div className="control">
                        <input className="input" type="number"
                            value={element.imageProperties.contrast}
                            onChange={(e) => this.props.updateElement({ ...element, imageProperties: { ...element.imageProperties, contrast: e.target.valueAsNumber } }, index)} />
                    </div>
                    <p className="control">
                        <a className="button is-static">
                            %
                        </a>
                    </p>
                </div>
            </div>

            <h3 className="title is-4">Position</h3>
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