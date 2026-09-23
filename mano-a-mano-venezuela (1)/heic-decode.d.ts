declare module 'heic-decode' {
  export interface DecodeOptions {
    buffer: ArrayBuffer | Uint8Array;
  }
  export interface DecodedImage {
    width: number;
    height: number;
    data: ArrayBuffer;
  }
  export default function decode(options: DecodeOptions): Promise<DecodedImage>;
  export function all(options: DecodeOptions): Promise<DecodedImage[]>;
}
