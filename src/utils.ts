import type { Model, TSubscription } from '@modelsjs/model';
import { getState, ModelState } from '@modelsjs/model';

function isUndefined(value: any): value is undefined {
    return typeof value === 'undefined';
}

export function isResolvable(model: Model) {
    return getState(model) === ModelState.Initial;
}

export function isResolved(model: Model) {
    return !isResolvable(model)
}

export function split(
    array: any[],
    match: { (item: Model): boolean }
): [ Model[], Model[] ] {
    return array.reduce((acc, item) => {
        (acc[match(item) ? 0 : 1] as any[]).push(item);

        return acc;
    }, [ [], [] ] as [ Model[], Model[] ])
}

export function has(key: string | symbol) {
    return (item: Model) => key in item;
}

type OnchangeCallback<T> = (changes: [ T, any, any ][]) => void

export const transaction = <T extends string>(fields: readonly T[], onchange: OnchangeCallback<T>) =>
    function transaction(this: Record<T, any>, tx: () => void) {
        const state = fields.reduce((acc, key) => {
            acc[key] = this[key];

            return acc;
        }, {} as Record<T, any>);

        tx();

        const changed = fields.filter((field) => {
            return this[field] !== state[field];
        });

        if (changed.length) {
            onchange(changed.map((field) => [ field, state[field], this[field] ]));
        }
    };

const call = (...args: any[]) => (fn: (...args: any[]) => void) => fn(...args);

export const events = <T extends string>(fields: readonly T[]) => {
    const subscriptions = fields.reduce((acc, field) => {
        acc[field] = new Set<TSubscription>();

        return acc;
    }, {} as Record<T, Set<TSubscription>>);

    return {
        subscribe(field: T, handler: TSubscription) {
            subscriptions[field].add(handler);

            return () => {
                subscriptions[field].delete(handler);
            };
        },

        notify(field: T, prev: any, next: any) {
            if (subscriptions[field].size) {
                [ ...subscriptions[field] ].forEach(call(next, prev));
            }
        }
    }
};
