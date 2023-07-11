import type { Model } from '@modelsjs/model';
import type { TResolver, ISyncResolver } from './types';

export async function resolve(models: Model[], resolvers: TResolver[]) {
    let [ resolved, rest ] = [ [] as Model[], models.slice() ];
    for (const resolver of resolvers) {
        if (!rest.length) {
            return;
        }

        if (isSync(resolver)) {
            [ resolved, rest ] = resolver.sync(models);
        } else {
            [ resolved, rest ] = await resolver.async(models);
        }
    }
}

resolve.sync = (models: Model[], resolvers: TResolver[]) => {
    let [ resolved, rest ] = [ [] as Model[], models.slice() ];
    for (const resolver of resolvers) {
        if (!rest.length) {
            return;
        }

        if (isSync(resolver)) {
            [ resolved, rest ] = resolver.sync(models);
        }
    }
}

function isSync(resolver: TResolver): resolver is ISyncResolver {
    return 'sync' in resolver;
}