import * as React from 'react';
import { Config } from '../../Types/Config';
import { getTextProperties } from '../../Types/TextProperties';
import { WBWellLabel, WBWellLabelElement } from '../../Types/WBWellLabel';

export interface IWBWellLabelRowRendererProps
{
    config: Config;

    labelRow: WBWellLabelElement;
    selection: number[];
    select: (selection: number[]) => void;
    onChange: (labelRow: WBWellLabelElement) => void;

    offset: number;
    rendering: boolean;
}

export class WBWellLabelRowRenderer extends React.Component<IWBWellLabelRowRendererProps, {}>
{
    private mergeSplitWellLabelAt(position: number)
    {
        let row = this.props.labelRow;
        let totalWidth = 0;

        for (let index = 0; index < row.labels.length; index++)
        {
            let label = row.labels[index];
            totalWidth += label.width;
            if (totalWidth === position + 1)
            {
                this.props.onChange({
                    ...row,
                    labels: [
                        ...row.labels.slice(0, index),
                        {
                            ...row.labels[index],
                            width: row.labels[index].width + row.labels[index + 1].width,
                            text: row.labels[index].text + "|" + row.labels[index + 1].text,
                        },
                        ...row.labels.slice(index + 2),
                    ]
                });
                break;
            }
            else if (totalWidth > position + 1)
            {
                let splitAt = position + 1 + label.width - totalWidth;
                let textParts = row.labels[index].text.split("|");

                let textA: string = row.labels[index].text;
                let textB: string = textA;
                if (textParts.length > splitAt)
                {
                    textA = textParts.slice(0, splitAt).join("|");
                    textB = textParts.slice(splitAt).join("|");
                }

                this.props.onChange({
                    ...row,
                    labels: [
                        ...row.labels.slice(0, index),
                        {
                            ...row.labels[index],
                            width: splitAt,
                            text: textA,
                        },
                        {
                            ...row.labels[index],
                            width: row.labels[index].width - splitAt,
                            text: textB,
                        },
                        ...row.labels.slice(index + 1),
                    ]
                });
                break;
            }
        };
    }

    private updateWellLabel(label: WBWellLabel, wellIndex: number)
    {
        this.props.onChange({
            ...this.props.labelRow,
            labels: [
                ...this.props.labelRow.labels.slice(0, wellIndex),
                label,
                ...this.props.labelRow.labels.slice(wellIndex + 1),
            ]
        });
    }

    public render(): JSX.Element
    {
        let offset = this.props.offset;
        let selection = this.props.selection;
        let row = this.props.labelRow;
        let labelRowWidth = (this.props.config.blotWidth - this.props.config.wellOutsideSpacing * 2);
        let rowLabelTextProperties = getTextProperties(this.props.labelRow.labelTextProperties, this.props.config.defaultTextProperties);
        let currentPosition = 0;

        return <g onClick={() => selection === undefined && this.props.select([])} style={{ cursor: this.props.selection !== undefined && ! this.props.rendering ? "default" : "pointer" }}>
            { /* Rectangle for outline and selection */}
            {!this.props.rendering && <rect x={0} y={offset} width={this.props.config.blotWidth} height={row.height}
                fill={this.props.selection !== undefined ? "none" : "transparent"}
                stroke="red"
                strokeWidth={this.props.selection !== undefined ? 2 : 0}
                strokeDasharray="2,2"
            />}
            
            { /* Render the label */}
            {(this.props.rendering || this.props.selection === undefined || this.props.selection[0] != 0) && <text
                y={offset + row.height - 10}
                x={this.props.config.blotWidth + this.props.config.elementLabelSpacing}
                fontWeight={rowLabelTextProperties.bold ? "bold" : "normal"}
                fontStyle={rowLabelTextProperties.italic ? "italic" : "normal"}
                fontSize={rowLabelTextProperties.size}
                fontFamily={rowLabelTextProperties.fontFamily}
                onClick={() => this.props.select([0])}
                cursor={this.props.rendering ? "default" : "pointer"}>
                {row.labelText}
            </text>}

            { /* Add helpers to allow merging/splitting of labels */}
            {!this.props.rendering && this.props.selection !== undefined && Array.from(Array(this.props.config.numberOfWells - 1).keys()).map(position => <rect key={"well-label-split-merge-helper-" + position}
                x={this.props.config.wellOutsideSpacing + labelRowWidth / this.props.config.numberOfWells * (position + 1) - this.props.config.wellSpacing * 0.5}
                y={offset}
                width={this.props.config.wellSpacing}
                height={row.height}
                fill="rgba(0, 0, 0, 0.1)"
                style={{ cursor: "e-resize" }}
                onClick={() => this.mergeSplitWellLabelAt(position)}
            />)}

            {row.labels.map((label, labelIndex) => {
                let labelX = this.props.config.wellOutsideSpacing + labelRowWidth / this.props.config.numberOfWells * currentPosition;
                let labelTextProperties = getTextProperties(label.textProperties, this.props.config.defaultTextProperties);
                if (labelTextProperties.justification == "start") labelX += this.props.config.wellSpacing * 0.5;
                if (labelTextProperties.justification == "end") labelX += label.width * labelRowWidth / this.props.config.numberOfWells - this.props.config.wellSpacing * 0.5;
                if (label.angled || labelTextProperties.justification == "middle") labelX += 0.5 * label.width * labelRowWidth / this.props.config.numberOfWells;

                let labelY = offset + row.height - 10;
                let labelSelected = this.props.selection !== undefined && this.props.selection[0] == labelIndex + 1;
                let result = <g key={"well-label-" + labelIndex}>
                    { /* The text */}
                    {!labelSelected && <text key={"well-label-" + labelIndex}
                        x={labelX}
                        y={labelY}
                        onClick={() => this.props.select([1 + labelIndex])}
                        textAnchor={label.angled ? "left" : labelTextProperties.justification}
                        fontWeight={labelTextProperties.bold ? "bold" : "normal"}
                        fontStyle={labelTextProperties.italic ? "italic" : "normal"}
                        fontSize={labelTextProperties.size}
                        fontFamily={labelTextProperties.fontFamily}
                        cursor={this.props.rendering ? "default" : "pointer"}
                        transform={label.angled ? `rotate(-${this.props.config.wellLabelAngle}, ${labelX}, ${labelY})` : ""}>
                        {label.text}
                    </text>}
                    
                    { /* The underline */ }
                    {(!this.props.rendering || label.underline) && <line key={"well-label-underline" + labelIndex}
                        x1={this.props.config.wellOutsideSpacing + labelRowWidth / this.props.config.numberOfWells * currentPosition + this.props.config.wellSpacing * 0.5}
                        x2={this.props.config.wellOutsideSpacing + labelRowWidth / this.props.config.numberOfWells * (currentPosition + label.width) - this.props.config.wellSpacing * 0.5}
                        y1={offset + row.height - 5}
                        y2={offset + row.height - 5}
                        stroke={ label.underline ? "black" : ( labelSelected ? "red" : "transparent" ) }
                        strokeWidth={this.props.config.strokeWidth} />}
                    { /* Add a thicker helper line that makes it easier to click the border */}
                    {!this.props.rendering && labelSelected && <line key={"well-label-underline-helper" + labelIndex}
                        x1={this.props.config.wellOutsideSpacing + labelRowWidth / this.props.config.numberOfWells * currentPosition + this.props.config.wellSpacing * 0.5}
                        x2={this.props.config.wellOutsideSpacing + labelRowWidth / this.props.config.numberOfWells * (currentPosition + label.width) - this.props.config.wellSpacing * 0.5}
                        y1={offset + row.height}
                        y2={offset + row.height}
                        stroke="transparent"
                        strokeWidth={10}
                        style={{ cursor: ! this.props.rendering ? 'pointer' : 'default' }}
                        onClick={() => this.updateWellLabel({ ...label, underline: !label.underline }, labelIndex)} />}
                </g>;

                currentPosition += label.width;
                return result;
            })}
        </g>
    }
}