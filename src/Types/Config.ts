import { DefaultTextProperties } from "./TextProperties";

export type Config = {
    numberOfWells: number,
    wellSpacing: number,
    wellOutsideSpacing: number,

    blotWidth: number,
    elementSpacing: number,
    elementLabelSpacing: number,
    wellLabelSpacing: number,
    wellLabelAngle: number,
    strokeWidth: number,

    defaultTextProperties: DefaultTextProperties,
}