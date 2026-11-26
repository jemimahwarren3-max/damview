declare module "react-image-file-resizer" {
  interface ResizeParams {
    file: File;
    maxWidth: number;
    maxHeight: number;
    compressFormat: string;
    quality: number;
    rotation?: number;
    responseUriFunc: (uri: string) => void;
    outputType?: string;
    minWidth?: number;
    minHeight?: number;
  }
  export default class Resizer {
    static imageFileResizer(
      file: File,
      maxWidth: number,
      maxHeight: number,
      compressFormat: string,
      quality: number,
      rotation: number,
      responseUriFunc: (uri: string | File | Blob | ProgressEvent<FileReader>) => void,
      outputType?: string,
      minWidth?: number,
      minHeight?: number,
    ): void;
  }
}

declare module "@marsidev/react-turnstile" {
  import { ComponentType, RefObject } from "react";

  interface TurnstileProps {
    siteKey: string;
    onSuccess?: (token: string) => void;
    onError?: () => void;
    onExpire?: () => void;
    options?: Record<string, unknown>;
    className?: string;
  }

  interface TurnstileInstance {
    reset: () => void;
    getResponse: () => string | undefined;
  }

  export const Turnstile: ComponentType<TurnstileProps & { ref?: RefObject<TurnstileInstance | null> }>;
  export type { TurnstileInstance };
}
