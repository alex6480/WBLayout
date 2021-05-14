import * as React from 'react';
import { App } from '../../App';
import { TextPropertiesEditor } from '../../Components/TextPropertiesEditor';
import { Config } from '../../Types/Config';
import { IImageObject } from '../../Types/IImageObject';
import { WBBlotElement } from '../../Types/WBBlotElement';
import { WBWellLabel } from '../../Types/WBWellLabel';

export interface IWBWellLabelEditorProps
{
    label: WBWellLabel;
    onChange: (label: WBWellLabel) => void;
}

export class WBWellLabelEditor extends React.Component<IWBWellLabelEditorProps, {}>
{
    public render(): JSX.Element
    {
        let label = this.props.label;
        return <div>
            <div className="field">
                <label className="label">Text</label>
                <div className="field">
                    <div className="control">
                        <input className="input" type="text"
                            value={label.text}
                            onChange={(e) => this.props.onChange({...label, text: e.target.value})} />
                    </div>
                </div>
            </div>
            <TextPropertiesEditor properties={label.textProperties} onChange={properties => this.props.onChange({ ...this.props.label, textProperties: properties })} allowDefault={true}/>
            <div className="field">
                <label className="checkbox">
                    <input type="checkbox" onChange={() => this.props.onChange({ ...label, underline: !label.underline })} checked={label.underline}/>
                    Underline
                </label>
            </div>
            <div className="field">
                <label className="checkbox">
                    <input type="checkbox" onChange={() => this.props.onChange({ ...label, angled: !label.angled })} checked={label.angled}/>
                    Angled
                </label>
            </div>
        </div>;
    }
}