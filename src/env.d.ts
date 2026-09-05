declare module '*.css?inline' {
  const css: string;
  export default css;
}

/** Package version, replaced at build time (see tsdown.config.ts / vitest.config.mts). */
declare const __RCT_VERSION__: string;
