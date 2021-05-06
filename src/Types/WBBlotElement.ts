export type WBBlotElement =
{
    type: "blot",
    label: string,
    imageIndex?: number,
    height: number,
    boundingBox: { x: number, width: number, y: number, rotation: number },
    imageProperties: {
        inverted: boolean,
        brightness: number,
        contrast: number,
    }
}