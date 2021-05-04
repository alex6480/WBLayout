import * as React from 'react';
import { App } from './App';
import { Config } from './Types/Config';
import { IImageObject } from './Types/IImageObject';

export interface IImageBrowserProps
{
    app: App;
    images: { [id: number]: IImageObject };
    showingImageIndex?: number;
    setImages: (images: {[id: number]: IImageObject }) => void;
    viewImage: (index?: number) => void;
}

export class ImageBrowser extends React.Component<IImageBrowserProps, {}>
{
    private AddImage(image: IImageObject)
    {
        let key = Object.keys(this.props.images).length > 0 ? Math.max(...Object.keys(this.props.images).map(i => Number(i))) + 1 : 1;
        this.props.setImages({
            ...this.props.images,
            [key]: image
        });
    }

    private replaceImage(key: number)
    {
        var inputElement = document.createElement("input");
        inputElement.setAttribute("type", "file");
        document.body.append(inputElement);
        inputElement.onchange = (ev) => {
            if (inputElement.files && inputElement.files.length) {
                var reader = new FileReader();
                reader.onload = () => {
                    var dataURL = reader.result;
                    let image = new Image();
                    image.src = dataURL as string;
                    image.onload = () => {
                        this.props.setImages({
                            ...this.props.images,
                            [key]: {
                                ...this.props.images[key],
                                data: dataURL as string,
                                name: inputElement.files[0].name,
                                size: {
                                    width: image.width,
                                    height: image.height
                                }
                            }
                        });
                    }
                };
                reader.readAsDataURL(inputElement.files[0]);
            }
        }
        inputElement.click();
        document.body.removeChild(inputElement);
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
                            <ImageUploadButton images={this.props.images} addImage={image => this.AddImage(image)}>Add Image</ImageUploadButton>
                        </td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
        </>;
    }
}

export interface IImageUploadButtonProps
{
    images: { [id: number]: IImageObject };
    addImage: (image: IImageObject) => void;
}

export class ImageUploadButton extends React.Component<IImageUploadButtonProps, {}>
{
    private fileUploaded(e: React.ChangeEvent<HTMLInputElement>)
    {
        var inputElement = e.target;
        if (inputElement.files && inputElement.files.length) {
            var reader = new FileReader();
            reader.onload = () => {
                var dataURL = reader.result;
                let image = new Image();
                image.src = dataURL as string;
                image.onload = () => {
                    this.props.addImage({
                        name: inputElement.files[0].name,
                        data: dataURL as string,
                        size: { width: image.width, height: image.height }
                    })
                }
            };
            reader.readAsDataURL(inputElement.files[0]);
        }
    }

    public render()
    {
        return <div className="file">
            <label className="file-label">
                <input className="file-input" type="file" onChange={e => this.fileUploaded(e)} />
                <span className="file-cta">
                    <span className="file-label">
                        { this.props.children }
                </span>
                </span>
            </label>
        </div>;
    }
}