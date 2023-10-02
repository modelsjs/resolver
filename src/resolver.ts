import type { Model, TSubscription } from '@modelsjs/model';
import type { TResolver } from './types';
import { set } from '@modelsjs/model';
import { resolve } from './resolve';
import { HandleError } from './errors';
import { isResolvable, isResolved, split, transaction, events } from './utils';

type TResolverFields = 'state';

type TLoopAction = () => boolean | Promise<boolean>;

type TControllableLoop = {
    start: (action: TLoopAction) => void | Promise<void>;
    started: boolean;
    promise: Promise<void>;
};

export enum ResolverState {
    Resolving = 'resolving',

    Resolved = 'resolved'
}

export class Resolver {
    private readonly models: Set<Model> = new Set();

    private loop: Nullable<TControllableLoop> = null;

    public get promise(): Nullable<Promise<void>> {
        return this.loop?.promise;
    }

    public get state(): ResolverState {
        switch (true) {
            case Boolean(this.loop && this.loop.started):
                return ResolverState.Resolving;
            default:
                return ResolverState.Resolved;
        }
    }

    private transaction = transaction(
        [ 'state' ] as TResolverFields[],
        (changes) => changes.forEach(([ field, prev, curr ]) => {
            this.events.notify(field, prev, curr);
        })
    );

    private events = events([ 'state' ] as TResolverFields[]);

    constructor(
        private readonly resolvers: TResolver[]
    ) {
    }

    public subscribe(field: TResolverFields, handler: TSubscription) {
        return this.events.subscribe(field, handler);
    }

    public run() {
        this.update();

        if (!this.loop) {
            return;
        }

        this.loop.start(async () => {
            const rest = await resolve([ ...this.models ], this.resolvers);

            if (rest.length) {
                rest.forEach((model) => {
                    set(model, new HandleError(model));
                });
            }

            this.update();

            return Boolean(this.models.size);
        });
    }

    public resolve = <T extends Model>(model: T): T => {
        this.transaction(() => {
            if (isResolvable(model)) {
                resolve.sync([ model ], this.resolvers);
            }

            if (isResolvable(model)) {
                this.models.add(model);
                this.update();
            }
        });

        return model;
    }

    private update() {
        this.transaction(() => {
            const [ work ] = split([ ...this.models ], isResolved);

            work.forEach((model) => this.models.delete(model));

            if (!this.models.size) {
                this.loop = null;
            } else {
                this.loop = this.loop || loop();
            }
        });
    }
}

function loop(): TControllableLoop {
    const control: {
        started: boolean;
        resolve: null | { (): void };
        reject: null | { (error: any): void };
    } = {
        started: false,
        resolve: null,
        reject: null,
    };

    const start: TControllableLoop['start'] = function start(this: TControllableLoop, action) {
        this.promise = this.promise.then(async () => {
            let next = true;
            while (next) {
                next = await action();
            }
        }).catch((error) => {
            control.started = false;
            control.reject?.(error);
        });

        control.started = true;
        control.resolve?.();
    }

    const promise = new Promise<void>((resolve, reject) => {
        control.resolve = resolve;
        control.reject = reject;
    });

    return {
        promise,
        start,
        get started() {
            return control.started;
        }
    };
}
