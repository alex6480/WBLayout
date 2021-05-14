import { TextProperties } from "./TextProperties"

export type WBWellLabelElement = {
    type: "well-label";
    height: number;
    labelText: string;
    labelTextProperties: TextProperties;
    labels: WBWellLabel[];
    selectedLabel?: number | "rowlabel";
}

export type WBWellLabel = {
    width: number;
    text: string;
    textProperties: TextProperties;
    angled: boolean;
    underline: boolean;
}