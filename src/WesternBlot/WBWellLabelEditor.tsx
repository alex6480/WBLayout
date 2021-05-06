import * as React from 'react';
import { App } from '../App';
import { Config } from '../Types/Config';
import { ImageUploadButton } from '../ImageBrowser';
import { IImageObject } from '../Types/IImageObject';
import { WBElement } from '../Types/WBElement';

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
            <div className="field">
                <label className="label">Justification</label>
                <div className="field">
                    <div className="buttons">
                        <button className={"button " + (label.justification == "left" ? "is-primary" : "")}
                            onClick={() => this.props.onChange({ ...label, justification: "left" })}>
                            Left
                        </button>
                        <button className={"button " + (label.justification == "middle" ? "is-primary" : "")}
                            onClick={() => this.props.onChange({ ...label, justification: "middle" })}>
                            Center
                        </button>
                        <button className={"button " + (label.justification == "right" ? "is-primary" : "")}
                            onClick={() => this.props.onChange({ ...label, justification: "right" })}>
                            Right
                        </button>
                    </div>
                </div>
            </div>
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