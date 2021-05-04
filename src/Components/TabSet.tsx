import * as React from 'react';

export interface ITabSetProps
{
    tabs: {
        name: string,
        content: JSX.Element
    }[]
}

interface ITabSetState
{
    currentTab: number;
}

export class TabSet extends React.Component<ITabSetProps, ITabSetState>
{
    constructor(props: ITabSetProps)
    {
        super(props);
        this.state = {
            currentTab: 0,
        };
    }

    public render(): JSX.Element
    {
        return <>
            <div className="tabs">
                <ul>
                    {this.props.tabs.map((tab, index) =><li className={index == this.state.currentTab ? "is-active" : ""}
                        onClick={() => this.setState({currentTab: index})}
                        key={index}>
                        <a>{tab.name}</a>
                    </li>)}
                </ul>
            </div>
            { this.props.tabs[this.state.currentTab].content }
        </>;
    }
}