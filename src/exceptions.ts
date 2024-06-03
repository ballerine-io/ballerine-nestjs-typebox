import { BadRequestException, HttpStatus } from '@nestjs/common';
import { TSchema } from '@sinclair/typebox/type';
import { ErrorObject } from 'ajv';

import type { ValidatorType } from './types.js';

export class AjvValidationException<TRequestSchema extends TSchema, TResponseSchema extends TSchema> extends BadRequestException {
    constructor(type: ValidatorType<TRequestSchema, TResponseSchema>, errors: Array<ErrorObject> | null | undefined) {
        const topLevelErrors: ErrorObject[] = [];
        const unionPaths: string[] = [];

        if (errors) {
            for (const error of errors) {
                // don't deeply traverse union errors to reduce error noise
                if (unionPaths.some(path => error.instancePath.includes(path))) continue;
                if (error.keyword === 'oneOf' || error.keyword === 'anyOf') {
                    unionPaths.push(error.instancePath);
                }
                topLevelErrors.push(error);
            }
        }

        super({
            statusCode: HttpStatus.BAD_REQUEST,
            message: `Validation error (${type})`,
            errors: topLevelErrors,
        });
    }
}
