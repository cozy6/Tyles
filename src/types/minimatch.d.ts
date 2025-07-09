declare module 'minimatch' {
  export = minimatch;
  function minimatch(target: string, pattern: string, options?: minimatch.IOptions): boolean;
  namespace minimatch {
    export interface IOptions {
      debug?: boolean;
      nobrace?: boolean;
      noglobstar?: boolean;
      dot?: boolean;
      noext?: boolean;
      nocase?: boolean;
      nonull?: boolean;
      matchBase?: boolean;
      nocomment?: boolean;
      nonegate?: boolean;
      flipNegate?: boolean;
    }
  }
}