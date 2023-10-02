import { Model, ModelError } from '@modelsjs/model';

export class HandleError extends ModelError {
    constructor(model: Model) {
        super(model, 'There is no resolvers matching this model.');
    }
}