declare module '*.png' {
  const src: string | { src: string; width?: number; height?: number };
  export default src;
}
declare module '*.jpg' {
  const src: string;
  export default src;
}
declare module '*.jpeg' {
  const src: string;
  export default src;
}
declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.css' {
  const content: string;
  export default content;
}

interface ImportMeta {
env: Record<string, any>;
}
interface ImportMetaEnv {
[key: string]: any;
}

declare module 'server-only' {}
