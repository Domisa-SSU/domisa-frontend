/// <reference types="vite/client" />

interface Window {
  gtag?: (...args: unknown[]) => void;
  dataLayer?: unknown[];
}

interface ImportMetaEnv {
  readonly VITE_KAKAO_REST_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.svg?react' {
  import * as React from 'react'
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
  export default ReactComponent
}
