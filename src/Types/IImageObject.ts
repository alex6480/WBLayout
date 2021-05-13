export interface IImageObject
{
    name: string | "missing",
    data?: string,
    size: { width: number, height: number },
    zoom: number,
    browserOffset: {x: number, y: number},
}