export class WBElement
{
    public label: string;
    public imageIndex?: number;
    public height: number;
    public boundingBox: { x: number, width: number, y: number, rotation: number };
    public imageProperties: {
        inverted: boolean,
        brightness: number,
        contrast: number,
    }
}