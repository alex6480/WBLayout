import * as React from 'react';
import { App } from '../../App';
import { Config } from '../../Types/Config';
import { IImageObject } from '../../Types/IImageObject';
import { WBBlotElement } from '../../Types/WBBlotElement';
import { WBWellLabelElement } from '../../Types/WBWellLabel';
import { WBWellLabelEditor } from './WBWellLabelEditor';

export interface IWBWellLabelelementEditorProps
{
    element: WBWellLabelElement;
    onChange: (labelRow: WBWellLabelElement) => void;
}

export class WBWellLabelElementEditor extends React.Component<IWBWellLabelelementEditorProps, {}>
{
    public render(): JSX.Element
    {
        let row = this.props.element;
        return <div>
            <h3 className="title is-4">General</h3>
            <div className="field">
                <label className="label">Row label</label>
                <div className="field">
                    <div className="control">
                        <input className="input" type="text"
                            value={row.labelText}
                            onChange={(e) => this.props.onChange({...row, labelText: e.target.value})} />
                    </div>
                </div>
            </div>
            <div className="field">
                <label className="label">Height</label>
                <div className="field has-addons">
                    <div className="control">
                        <input className="input" type="number"
                            value={row.height}
                            onChange={(e) => this.props.onChange({ ...row, height: e.target.valueAsNumber })} />
                    </div>
                    <p className="control">
                        <a className="button is-static">
                            px
                        </a>
                    </p>
                </div>
            </div>

            <h3 className="title is-4">Labels</h3>
            {row.labels.map((label, index) => <WBWellLabelEditor key={index} label={label} onChange={label => this.props.onChange({
                ...row, labels: [
                    ...row.labels.slice(0, index),
                    label,
                    ...row.labels.slice(index + 1)
                ]
            })} />)}
        </div>;
    }
}