import * as React from 'react';
import { App } from '../../App';
import { Config } from '../../Types/Config';
import { IImageObject } from '../../Types/IImageObject';
import { WBBlotElement } from '../../Types/WBBlotElement';

export interface IWBBlotElementEditorProps
{
    element: WBBlotElement;
    onChange: (element: WBBlotElement) => void;
    images: { [id: number]: IImageObject };
    setImages: (images: {[id: number]: IImageObject }) => void;
    uploadNewImage: () => Promise<IImageObject>;
}

export class WBBlotElementEditor extends React.Component<IWBBlotElementEditorProps, {}>
{
    private async AddNewImage()
    {
        let image = await this.props.uploadNewImage();
        let key = Object.keys(this.props.images).length > 0 ? Math.max(...Object.keys(this.props.images).map(i => Number(i))) + 1 : 1;
        this.props.setImages({
            ...this.props.images,
            [key]: image
        });
        this.props.onChange({
            ...this.props.element,
            imageIndex: key,
        });
    }

    public render(): JSX.Element
    {
        let element = this.props.element;
        return <div>
            <h3 className="title is-4">General</h3>
            <div className="field">
                <label className="label">Label</label>
                <div className="field">
                    <div className="control">
                        <input className="input" type="text"
                            value={element.label}
                            onChange={(e) => this.props.onChange({...element, label: e.target.value})} />
                    </div>
                </div>
            </div>

            <h3 className="title is-4">Image</h3>
            <div className="field">
                <label className="label">Image</label>
                <div className="field">
                    <div className="control">
                        { Object.keys(this.props.images).length === 0
                            ? <button className="button" onClick={() => this.AddNewImage()}>Add image</button>
                            : <div className="select">
                                <select onChange={(e) => this.props.onChange({ ...element, imageIndex: e.target.value !== "no-image" ? Number(e.target.value) : undefined })}
                                    value={element.imageIndex === undefined || this.props.images[element.imageIndex] === undefined ? "no-image" : element.imageIndex}>
                                    {<option key="no-image" value="no-image" disabled={true}>Select an image</option>}
                                    {Object.keys(this.props.images).map(id => <option key={id} value={id}>
                                        {this.props.images[Number(id)].name}
                                    </option>)}
                                    <option onClick={() => this.AddNewImage()}>Add image</option>
                                </select>
                            </div> }
                    </div>
                </div>
            </div>
            <div className="field">
                <label className="checkbox">
                    <input type="checkbox" onChange={e => this.props.onChange({
                            ...element,
                            imageProperties: { ...element.imageProperties, inverted: !element.imageProperties.inverted }
                        })}
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
                            onChange={(e) => this.props.onChange({ ...element, imageProperties: { ...element.imageProperties, brightness: e.target.valueAsNumber } })} />
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
                            onChange={(e) => this.props.onChange({ ...element, imageProperties: { ...element.imageProperties, contrast: e.target.valueAsNumber } })} />
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
                            onChange={(e) => this.props.onChange({ ...element, boundingBox: { ...element.boundingBox, x: e.target.valueAsNumber } })} />
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
                            onChange={(e) => this.props.onChange({ ...element, boundingBox: { ...element.boundingBox, y: e.target.valueAsNumber } })} />
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
                            onChange={(e) => this.props.onChange({ ...element, boundingBox: { ...element.boundingBox, width: e.target.valueAsNumber } })} />
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
                            onChange={(e) => this.props.onChange({...element, height: e.target.valueAsNumber})} />
                    </div>
                </div>
            </div>
            <div className="field">
                <label className="label">Rotation</label>
                <div className="field has-addons">
                    <div className="control">
                        <input className="input" type="number"
                            value={element.boundingBox.rotation}
                            onChange={(e) => this.props.onChange({ ...element, boundingBox: { ...element.boundingBox, rotation: e.target.valueAsNumber } })} />
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