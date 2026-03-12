export interface DataGenerationPack<TData, TInput = unknown> {
  createDefault(): Promise<TData>;
  createCustom?(input: TInput): Promise<TData>;
  delete(data: TData): Promise<void>;
}

export type AnyPack = DataGenerationPack<any, any>;
export type PackClass<TPack extends AnyPack = AnyPack> = new () => TPack;

export type PackInstance<
  TRegistry extends Record<string, PackClass>,
  TName extends keyof TRegistry,
> = InstanceType<TRegistry[TName]>;

export type PackOutput<TPack> = TPack extends DataGenerationPack<infer TData, any>
  ? TData
  : never;

export type PackInput<TPack> = TPack extends DataGenerationPack<any, infer TInput>
  ? TInput
  : never;

export type CustomPackKeys<TRegistry extends Record<string, PackClass>> = {
  [K in keyof TRegistry]: InstanceType<TRegistry[K]> extends {
    createCustom(input: any): Promise<any>;
  }
    ? K
    : never;
}[keyof TRegistry];
