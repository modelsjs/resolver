import type { Model } from '@modelsjs/model';
import type { TResolver, IResolver, ISyncResolver } from './types';
import { isResolvable, split, has } from './utils';

export async function resolve(models: Model[], resolvers: TResolver[]) {
    let rest = models.slice();
    let work: Model[] = [];
    let skip: Model[] = [];

    for (const resolver of resolvers) {
        [ work, rest ] = split(rest, has(resolver.strategy));

        if (work.length) {
            try {
                if (isSync(resolver)) {
                    resolver.sync(work.slice());
                } else {
                    await resolver.async(work.slice());
                }
            } catch (error) {
                // TODO: implement debug logger
                console.error(error);
            }

            // We expect what user defined resolvers will make this check.
            // But we can't hope to external code.
            [ skip ] = split(work, isResolvable);

            rest = [ ...skip, ...rest ];
        }
    }

    return rest;
}

resolve.sync = (models: Model[], resolvers: TResolver[]) => {
    let rest = models.slice();
    let done = [];
    let undone = [];

    for (const resolver of resolvers) {
        if (!rest.length) {
            return;
        }

        const [ work, skip ] = split(rest, has(resolver.strategy));

        if (work.length) {
            rest = skip;

            if (isSync(resolver)) {
                [ done, rest = [] ] = resolver.sync(work);
                [ undone ] = split(done, isResolvable);
                rest = [ ...undone, ...skip, ...rest ];
            }
        }
    }

    return rest;
}

function isSync(resolver: TResolver): resolver is IResolver & ISyncResolver {
    return 'sync' in resolver;
}