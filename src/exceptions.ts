import { BadRequestException, HttpStatus } from '@nestjs/common';
import { ErrorObject } from 'ajv';

import type { ValidatorType } from './types.js';

export class AjvValidationException extends BadRequestException {
    constructor(type: ValidatorType, errors: Array<ErrorObject> | null | undefined) {
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
            message: `Validation failed (${type})`,
            errors: topLevelErrors,
        });
    }
}
