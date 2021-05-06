import * as React from 'react';
import { App } from './App';
import { Config } from './Types/Config';
import { IImageObject } from './Types/IImageObject';

export interface IImageBrowserProps
{
    app: App;
    images: { [id: number]: IImageObject };
    showingImageIndex?: number;
    setImages: (images: { [id: number]: IImageObject }) => void;
    uploadNewImage: () => Promise<IImageObject>;
    viewImage: (index?: number) => void;
}

export class ImageBrowser extends React.Component<IImageBrowserProps, {}>
{
    private async AddImage()
    {
        let image = await this.props.uploadNewImage();
        let key = Object.keys(this.props.images).length > 0 ? Math.max(...Object.keys(this.props.images).map(i => Number(i))) + 1 : 1;
        this.props.setImages({
            ...this.props.images,
            [key]: image
        });
    }

    private async replaceImage(key: number)
    {
        this.props.setImages({
            ...this.props.images,
            [key]: await this.props.uploadNewImage()
        });
    }

    public render(): JSX.Element
    {
        return <>
            <table className="table is-fullwidth">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                {
                    Object.keys(this.props.images).map(index => <tr key={index}>
                        <td>
                            {this.props.images[Number(index)].data === undefined && <span style={{ color: "red", fontWeight: "bold" }}>Missing!</span>}
                            {this.props.images[Number(index)].name}
                        </td>
                        <td>
                            <div className="buttons">
                                {this.props.showingImageIndex === Number(index)
                                    ? <a className="button is-small" onClick={() => this.props.viewImage(undefined)}>Close</a>
                                    : <a className="button is-small" onClick={() => this.props.viewImage(Number(index))}>View</a>
                                }
                                <a className="button is-small" onClick={() => this.props.setImages(
                                    Object.keys(this.props.images).reduce((object, key) => {
                                        if (index != key)
                                        {
                                            object[Number(key)] = this.props.images[Number(key)];
                                        }
                                        return object;
                                    }, {} as { [k: number]: any}) as any)}
                                >Remove</a>
                                <a className="button is-small" onClick={() => this.replaceImage(Number(index))}>Replace</a>
                            </div>
                        </td>
                    </tr>)
                    }
                    <tr>
                        <td>
                            <button className="button" onClick={() => this.AddImage()}>Add Image</button>
                        </td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
        </>;
    }
}