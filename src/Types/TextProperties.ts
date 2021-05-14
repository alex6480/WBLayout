export type TextProperties = {
    size: number | "default";
    bold: boolean | "default";
    italic: boolean | "default";
    justification: "start" | "middle" | "end" | "default";
    fontFamily: string | "default";
}

export type DefaultTextProperties = {
    size: number;
    bold: boolean;
    italic: boolean;
    justification: "start" | "middle" | "end";
    fontFamily: string;
}

export let defaultTextProperties: DefaultTextProperties = {
    size: 16,
    bold: false,
    italic: false,
    justification: "middle",
    fontFamily: "sans-serif",
}

export function getTextProperties(properties: TextProperties, defaultProperties: DefaultTextProperties): DefaultTextProperties
{
    return {
        size: properties.size === "default" ? defaultProperties.size : properties.size,
        justification: properties.justification === "default" ? defaultProperties.justification : properties.justification,
        bold: properties.bold === "default" ? defaultProperties.bold : properties.bold,
        italic: properties.italic === "default" ? defaultProperties.italic : properties.italic,
        fontFamily: properties.fontFamily === "default" ? defaultTextProperties.fontFamily : properties.fontFamily,
    }
}