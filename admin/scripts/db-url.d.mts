type Picked = { name: string; url: string } | null;
export declare const runtimeDb: () => Picked;
export declare const migrationDb: () => Picked;
export declare const unusableDbVars: () => string[];
export declare const dbVarNames: () => string[];
