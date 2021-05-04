export type Vector = {
    a: number,
    b: number,
}

export function rotateVector(vector: Vector, angle: number): Vector
{
    let cos = Math.cos(angle / 180 * Math.PI);
    let sin = Math.sin(angle / 180 * Math.PI);
    return {
        a: vector.a * cos - vector.b * sin,
        b: vector.a * sin + vector.b * cos
    };
}