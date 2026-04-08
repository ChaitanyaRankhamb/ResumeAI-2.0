declare module "react-syntax-highlighter" {
  // The library ships without TypeScript declarations in this project.
  // We only need enough typing to satisfy `next build` type-checking.
  export const Prism: any
}

declare module "react-syntax-highlighter/dist/esm/styles/prism" {
  export const oneDark: any
}

