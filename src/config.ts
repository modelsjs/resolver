import { IStrategy } from './types';

const prop = <T>(key: string, defaults?: T) => ({
        get(): T {
            if (defaults) {
                return defaults;
            }

            throw new Error(`Key '${key}' is not configured.`);
        },

        set(value: T) {
            Object.defineProperty(this, key, {
                set() {
                    throw new Error(`Key '${key}' is already configured.`);
                },

                get() {
                    return value;
                }
            });
        }
    });

export const config = Object.create(null, {
    defaultStrategy: prop<Nullable<IStrategy>>('defaultStrategy', null)
});