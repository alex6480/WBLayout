import * as React from 'react';
import { App } from '../App';
import { Config } from '../Config';
import { IImageObject } from '../Main';
import { WBElement } from './WBElement';

export interface IWBElementEditorProps
{
    elements: WBElement[];
    elementIndex: number;
    updateElement: (element: WBElement, index: number) => void;
}

export class WBElementEditor extends React.Component<IWBElementEditorProps, {}>
{
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
                        <input className="input" type="number"
                            value={element.imageIndex}
                            onChange={(e) => this.props.updateElement({...element, imageIndex: e.target.valueAsNumber}, index)} />
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