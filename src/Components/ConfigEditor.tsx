import * as React from 'react';
import { App } from '../App';
import { Config } from '../Types/Config';
import { TextPropertiesEditor } from './TextPropertiesEditor';

export interface IConfigEditorProps
{
    config: Config
    setConfig: (config: Config) => void;
}

export class ConfigEditor extends React.Component<IConfigEditorProps, {}>
{
    public render(): JSX.Element
    {
        return <>
            <div className="field">
                <label className="label">Width of blot</label>
                <div className="field has-addons">
                    <div className="control">
                        <input className="input" type="number"
                            value={this.props.config.blotWidth}
                            onChange={(e) => this.props.setConfig({ ...this.props.config, blotWidth: e.target.valueAsNumber })} />
                    </div>
                    <p className="control">
                        <a className="button is-static">
                            px
                        </a>
                    </p>
                </div>
            </div>
            <div className="field">
                <label className="label">Spacing between elements</label>
                <div className="field has-addons">
                    <div className="control">
                        <input className="input" type="number"
                            value={this.props.config.elementSpacing}
                            onChange={(e) => this.props.setConfig({ ...this.props.config, elementSpacing: e.target.valueAsNumber })} />
                    </div>
                    <p className="control">
                        <a className="button is-static">
                            px
                        </a>
                    </p>
                </div>
            </div>
            <div className="field">
                <label className="label">Spacing between elements and their labels</label>
                <div className="field has-addons">
                    <div className="control">
                        <input className="input" type="number"
                            value={this.props.config.elementLabelSpacing}
                            onChange={(e) => this.props.setConfig({ ...this.props.config, elementLabelSpacing: e.target.valueAsNumber })} />
                    </div>
                    <p className="control">
                        <a className="button is-static">
                            px
                        </a>
                    </p>
                </div>
            </div>
            <div className="field">
                <label className="label">Spacing between well labels and the first element</label>
                <div className="field has-addons">
                    <div className="control">
                        <input className="input" type="number"
                            value={this.props.config.wellLabelSpacing}
                            onChange={(e) => this.props.setConfig({ ...this.props.config, wellLabelSpacing: e.target.valueAsNumber })} />
                    </div>
                    <p className="control">
                        <a className="button is-static">
                            px
                        </a>
                    </p>
                </div>
            </div>
            <div className="field">
                <label className="label">Angle of angled well labels</label>
                <div className="field has-addons">
                    <div className="control">
                        <input className="input" type="number"
                            value={this.props.config.wellLabelAngle}
                            onChange={(e) => this.props.setConfig({ ...this.props.config, wellLabelAngle: e.target.valueAsNumber })} />
                    </div>
                    <p className="control">
                        <a className="button is-static">
                            ??
                        </a>
                    </p>
                </div>
            </div>
            <div className="field">
                <label className="label">Stroke width</label>
                <div className="field has-addons">
                    <div className="control">
                        <input className="input" type="number"
                            value={this.props.config.strokeWidth}
                            onChange={(e) => this.props.setConfig({ ...this.props.config, strokeWidth: e.target.valueAsNumber })} />
                    </div>
                    <p className="control">
                        <a className="button is-static">
                            px
                        </a>
                    </p>
                </div>
            </div>
            <div className="field">
                <label className="label">Number of wells</label>
                <div className="field has-addons">
                    <div className="control">
                        <input className="input" type="number"
                            value={this.props.config.numberOfWells}
                            onChange={(e) => this.props.setConfig({ ...this.props.config, numberOfWells: e.target.valueAsNumber })} />
                    </div>
                    <p className="control">
                        <a className="button is-static">
                            px
                        </a>
                    </p>
                </div>
            </div>
            <div className="field">
                <label className="label">Spacing before the first well and after the last</label>
                <div className="field has-addons">
                    <div className="control">
                        <input className="input" type="number"
                            value={this.props.config.wellOutsideSpacing}
                            onChange={(e) => this.props.setConfig({ ...this.props.config, wellOutsideSpacing: e.target.valueAsNumber })} />
                    </div>
                    <p className="control">
                        <a className="button is-static">
                            px
                        </a>
                    </p>
                </div>
            </div>
            <div className="field">
                <label className="label">Spacing between wells</label>
                <div className="field has-addons">
                    <div className="control">
                        <input className="input" type="number"
                            value={this.props.config.wellSpacing}
                            onChange={(e) => this.props.setConfig({ ...this.props.config, wellSpacing: e.target.valueAsNumber })} />
                    </div>
                    <p className="control">
                        <a className="button is-static">
                            px
                        </a>
                    </p>
                </div>
            </div>
            <TextPropertiesEditor properties={this.props.config.defaultTextProperties} allowDefault={false} onChange={
                properties => this.props.setConfig({ ...this.props.config, defaultTextProperties: properties })
            } />
        </>;
    }
}