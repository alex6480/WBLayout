type WBWellLabelRow = {
    height: number,
    labelText: string,
    labels: WBWellLabel[];
}

type WBWellLabel = {
    width: number,
    underline: boolean,
    text: string,
    justification: "left" | "right" | "middle",
    angled: boolean,
}