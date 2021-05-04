import * as React from 'react';
import { App } from './App';
import { Config } from './Config';

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
                            value={this.props.config.spacing}
                            onChange={(e) => this.props.setConfig({ ...this.props.config, spacing: e.target.valueAsNumber })} />
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
                            value={this.props.config.spacing}
                            onChange={(e) => this.props.setConfig({ ...this.props.config, labelSpacing: e.target.valueAsNumber })} />
                    </div>
                    <p className="control">
                        <a className="button is-static">
                            px
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
        </>;
    }
}