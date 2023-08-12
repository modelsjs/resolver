import type { Model } from '@modelsjs/model';
import type { TResolver, IResolver, ISyncResolver } from './types';
import { split, has } from './utils';

export async function resolve(models: Model[], resolvers: TResolver[]) {
    let rest = models.slice();

    for (const resolver of resolvers) {
        if (!rest.length) {
            return;
        }

        const [ work, skip ] = split(rest, has(resolver.strategy));

        if (work.length) {
            rest = skip;

            if (isSync(resolver)) {
                [ , rest = [] ] = resolver.sync(work);
                rest = [ ...skip, ...rest ];
            } else {
                [ , rest = [] ] = await resolver.async(work);
                rest = [ ...skip, ...rest ];
            }
        }
    }
}

resolve.sync = (models: Model[], resolvers: TResolver[]) => {
    let rest = models.slice();

    for (const resolver of resolvers) {
        if (!rest.length) {
            return;
        }

        const [ work, skip ] = split(rest, has(resolver.strategy));

        if (work.length) {
            rest = skip;

            if (isSync(resolver)) {
                [ , rest = [] ] = resolver.sync(work);
                rest = [ ...skip, ...rest ];
            }
        }
    }
}

function isSync(resolver: TResolver): resolver is IResolver & ISyncResolver {
    return 'sync' in resolver;
}