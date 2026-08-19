// Type declarations for custom imports

// CSS imported as raw string using raw-loader
declare module '*.css?raw' {
  const content: string;
  export default content;
}

// CSS imported as raw string using webpack inline loader syntax
declare module '!!raw-loader!*' {
  const content: string;
  export default content;
}
