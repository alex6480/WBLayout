import * as React from 'react';
import { App } from '../../App';
import { TextPropertiesEditor } from '../../Components/TextPropertiesEditor';
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

            {this.props.element.selectedLabel !== undefined && <>
                <h3 className="title is-4">Selected label</h3>
                {this.props.element.selectedLabel === "rowlabel"
                    ? <>
                        <div className="field">
                            <label className="label">Text</label>
                            <div className="field">
                                <div className="control">
                                    <input className="input" type="text"
                                        value={row.labelText}
                                        onChange={(e) => this.props.onChange({ ...row, labelText: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <TextPropertiesEditor
                            allowDefault={true}
                            properties={this.props.element.labelTextProperties}
                            onChange={props => this.props.onChange({ ...this.props.element, labelTextProperties: props })} />
                    </>
                    : <WBWellLabelEditor key={this.props.element.selectedLabel} label={this.props.element.labels[this.props.element.selectedLabel]} onChange={label => this.props.onChange({
                        ...row, labels: [
                            ...row.labels.slice(0, this.props.element.selectedLabel as number),
                            label,
                            ...row.labels.slice(this.props.element.selectedLabel as number + 1)
                        ]
                    })} />}
            </>}
        </div>;
    }
}