import type { Model } from '@modelsjs/model';

function isUndefined(value: any): value is undefined {
    return typeof value === 'undefined';
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