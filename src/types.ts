import type { Model } from '@modelsjs/model';

export type TDecorated<T> = T & {
    [prop: symbol]: IStrategy
};

export interface IResolver {
    readonly strategy: symbol;
}

export interface ISyncResolver {
    sync(models: Model[]): [ Model[], Model[] ] | [ Model[] ];
}

export interface IAsyncResolver {
    async(models: Model[]): Promise<[ Model[], Model[] ] | [ Model[] ]>;
}

export type TResolver = IResolver & OneOf<ISyncResolver & IAsyncResolver>;

export interface IStrategy {
    kind: symbol;
}