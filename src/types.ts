import type { Model } from '@modelsjs/model';

export type TDecorated<T> = T & {
    [prop: symbol]: IStrategy
};

export interface ISyncResolver {
    sync(models: Model[]): [ Model[], Model[] ];
}

export interface IAsyncResolver {
    async(models: Model[]): Promise<[ Model[], Model[] ]>;
}

export type TResolver = OneOf<ISyncResolver & IAsyncResolver>;

export interface IStrategy {
    kind: symbol;
}