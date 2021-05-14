import * as React from 'react';
import { DefaultTextProperties, defaultTextProperties, TextProperties } from '../Types/TextProperties';

export type ITextPropertiesEditorProps =
{
    properties: DefaultTextProperties;
    onChange: (properties: DefaultTextProperties) => void;
    allowDefault: false;
} | {
    properties: TextProperties;
    onChange: (properties: TextProperties) => void;
    allowDefault: true;
}

export class TextPropertiesEditor extends React.Component<ITextPropertiesEditorProps, {}>
{
    constructor(props: ITextPropertiesEditorProps)
    {
        super(props);
        this.state = { };
    }

    private onChange(properties: TextProperties)
    {
        if (this.props.allowDefault)
        {
            this.props.onChange(properties);
        }
        else
        {
            this.props.onChange(properties as DefaultTextProperties);
        }
    }

    public render(): JSX.Element
    {
        let props = this.props.properties;
        return <>
            <div className="notification">
                <p className="title is-4">{this.props.allowDefault ? <>Text properties</> : <>Default text properties</>}</p>

                <div className="field">
                    <label className="label">Size</label>
                    { this.props.allowDefault && <div className="field">
                        <label className="checkbox">
                            <input type="checkbox"
                                onChange={() => this.onChange({ ...props, size: props.size === "default" ? defaultTextProperties.size : "default" })}
                                checked={props.size === "default"} />
                            Use default
                        </label>
                    </div> }
                    {props.size !== "default" && <div className="field has-addons">
                        <div className="control">
                            <input className="input" type="number"
                                value={props.size}
                                onChange={(e) => this.onChange({ ...props, size: e.target.valueAsNumber })} />
                        </div>
                        <p className="control">
                            <a className="button is-static">
                                px
                            </a>
                        </p>
                    </div>}
                </div>

                <div className="field">
                    <label className="label">Bold</label>
                    { this.props.allowDefault && <div className="field">
                        <label className="checkbox">
                            <input type="checkbox"
                                onChange={() => this.onChange({ ...props, bold: props.bold === "default" ? defaultTextProperties.bold : "default" })}
                                checked={props.bold == "default"} />
                            Use default
                        </label>
                    </div> }
                    {props.bold !== "default" && <div className="field">
                        <div className="buttons">
                            <button className={"button " + (props.bold ? "is-primary" : "")}
                                onClick={() => this.onChange({ ...props, bold: true })}>
                                Yes
                            </button>
                            <button className={"button " + (!props.bold ? "is-primary" : "")}
                                onClick={() => this.onChange({ ...props, bold: false })}>
                                No
                            </button>
                        </div>
                    </div>}
                </div>

                <div className="field">
                    <label className="label">Italic</label>
                    { this.props.allowDefault && <div className="field">
                        <label className="checkbox">
                            <input type="checkbox"
                                onChange={() => this.onChange({ ...props, italic: props.italic === "default" ? defaultTextProperties.italic : "default" })}
                                checked={props.italic == "default"} />
                            Use default
                        </label>
                    </div> }
                    {props.italic !== "default" && <div className="field">
                        <div className="buttons">
                            <button className={"button " + (props.italic ? "is-primary" : "")}
                                onClick={() => this.onChange({ ...props, italic: true })}>
                                Yes
                            </button>
                            <button className={"button " + (!props.italic ? "is-primary" : "")}
                                onClick={() => this.onChange({ ...props, italic: false })}>
                                No
                            </button>
                        </div>
                    </div>}
                </div>

                <div className="field">
                    <label className="label">Justification</label>
                    { this.props.allowDefault && <div className="field">
                        <label className="checkbox">
                            <input type="checkbox"
                                onChange={() => this.onChange({ ...props, justification: props.justification === "default" ? defaultTextProperties.justification : "default" })}
                                checked={props.justification == "default"} />
                            Use default
                        </label>
                    </div> }
                    {props.justification !== "default" && <div className="field">
                        <div className="buttons">
                            <button className={"button " + (props.justification == "start" ? "is-primary" : "")}
                                onClick={() => this.onChange({ ...props, justification: "start" })}>
                                Left
                            </button>
                            <button className={"button " + (props.justification == "middle" ? "is-primary" : "")}
                                onClick={() => this.onChange({ ...props, justification: "middle" })}>
                                Center
                            </button>
                            <button className={"button " + (props.justification == "end" ? "is-primary" : "")}
                                onClick={() => this.onChange({ ...props, justification: "end" })}>
                                Right
                            </button>
                        </div>
                    </div>}
                </div>
            </div>
        </>;
    }
}