import View = require('../View');

export type GlTextureTypes = 
    HTMLImageElement  |
    HTMLVideoElement |
    ImageData |
    CanvasRenderingContext2D;

export type GlValue = number | number[] | GlTextureTypes;

export interface Hashtable<V> {
    [key: string] : V; 
};

export interface ShaderSpecification <T,U,V> {
    GetProgram(gl : WebGLRenderingContext) : WebGLProgram;
};

export interface RenderCallback {
    (view : View): void;
}
