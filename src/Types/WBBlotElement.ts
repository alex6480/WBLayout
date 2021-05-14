import { TextProperties } from "./TextProperties";

export type WBBlotElement =
{
    type: "blot",
    label: string,
    labelTextProperties: TextProperties,
    imageIndex?: number,
    height: number,
    boundingBox: { x: number, width: number, y: number, rotation: number },
    imageProperties: {
        inverted: boolean,
        brightness: number,
        contrast: number,
    }
}