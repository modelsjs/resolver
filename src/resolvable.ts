import type { Model } from '@modelsjs/model';
import type { IStrategy } from './types';
import { config } from './config';
import { ResolveStrategy } from './symbols';

type TStrategies = Record<symbol, IStrategy>;

export interface IResolvable<M extends Model> {
    [prop: string]: any;

    [ResolveStrategy]: TStrategies;
}

export function resolvable<M extends Model>(strategy: IStrategy): ClassDecorator
export function resolvable<M extends Model>(target: ClassDescriptor): void
export function resolvable<M extends Model>(target: any): any {
    const strategy: IStrategy = isClassDescriptor(target) ? config.defaultStrategy : target;

    function decorator({elements}: ClassDescriptor) {
        elements.push({
            kind: 'field',
            placement: 'own',
            key: strategy.kind,
            descriptor: {},
            initializer: function() {
                return strategy;
            }
        } as FieldDescriptor);
    }

    return isClassDescriptor(target) ? decorator(target) : decorator;
}

resolvable.get = <M extends Model>(resolvable: Partial<IResolvable<M>>): TStrategies | null => {
    return resolvable[ResolveStrategy] || null;
}

function isClassDescriptor(target: any): target is ClassDescriptor {
    return target?.kind === 'class' && Array.isArray(target.elements);
}