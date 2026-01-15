declare module "maath/random" {
  export function inSphere(
    array: Float32Array,
    options?: { radius?: number }
  ): Float32Array;
}