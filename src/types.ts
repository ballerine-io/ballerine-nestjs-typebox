import type { PipeTransform, Type } from '@nestjs/common';
import { ApiOperationOptions } from '@nestjs/swagger';
import type { Static, TComposite, TOmit, TPartial, TPick, TSchema } from '@sinclair/typebox';
import { ValidateFunction } from 'ajv';

export type AllKeys<T> = T extends unknown ? Exclude<keyof T, symbol> : never;

export type Obj<T = unknown> = Record<string, T>;

// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
export type MethodDecorator<T extends Function = any> = (
    // eslint-disable-next-line @typescript-eslint/ban-types
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>
) => TypedPropertyDescriptor<T> | void;

export interface HttpEndpointDecoratorConfig<
    TTSchema extends TSchema,
    ResponseConfig extends ResponseValidatorConfig<TTSchema> = ResponseValidatorConfig<TTSchema>,
    RequestConfigs extends RequestValidatorConfig[] = RequestValidatorConfig[],
> extends Omit<ApiOperationOptions, 'requestBody' | 'parameters'> {
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
    responseCode?: number;
    path?: string;
    validate?: ValidatorConfig<TTSchema, ResponseConfig, RequestConfigs>;
}

export interface SchemaValidator<TTSchema extends TSchema> {
    schema: TTSchema;
    name: string;
    check: ValidateFunction<Static<TTSchema>>;
    validate(data: Obj | Obj[]): Static<TTSchema>;
}
export interface ValidatorConfigBase<TTSchema extends TSchema> {
    schema?: TTSchema;
    coerceTypes?: boolean;
    stripUnknownProps?: boolean;
    name?: string;
    required?: boolean;
    pipes?: (PipeTransform | Type<PipeTransform>)[];
}
export interface ResponseValidatorConfig<TTSchema extends TSchema> extends ValidatorConfigBase<TTSchema> {
    schema: TTSchema;
    type?: 'response';
    responseCode?: number;
    required?: true;
    pipes?: never;
}

export interface ParamValidatorConfig<TTSchema extends TSchema> extends ValidatorConfigBase<TTSchema> {
    schema?: TTSchema;
    type: 'param';
    name: string;
    stripUnknownProps?: never;
}

export interface QueryValidatorConfig<TTSchema extends TSchema> extends ValidatorConfigBase<TTSchema> {
    schema?: TTSchema;
    type: 'query';
    name: string;
    stripUnknownProps?: never;
}

export interface BodyValidatorConfig<TTSchema extends TSchema> extends ValidatorConfigBase<TTSchema> {
    schema: TTSchema;
    type: 'body';
}

export type RequestValidatorConfig<TTSchema extends TSchema> =
    | ParamValidatorConfig<TTSchema>
    | QueryValidatorConfig<TTSchema>
    | BodyValidatorConfig<TTSchema>;
export type SchemaValidatorConfig<TTSchema extends TSchema> = RequestValidatorConfig<TTSchema> | ResponseValidatorConfig<TTSchema>;

export type ValidatorType = NonNullable<SchemaValidatorConfig['type']>;

export interface ValidatorConfig<
    TTSchema extends TSchema,
    ResponseConfig extends ResponseValidatorConfig<TTSchema>,
    RequestConfigs extends RequestValidatorConfig[],
> {
    response?: TTSchema | ResponseConfig;
    request?: [...RequestConfigs];
}

export type RequestConfigsToTypes<RequestConfigs extends RequestValidatorConfig[]> = {
    [K in keyof RequestConfigs]: RequestConfigs[K]['required'] extends false
        ? RequestConfigs[K]['schema'] extends TSchema
            ? Static<RequestConfigs[K]['schema']> | undefined
            : string | undefined
        : RequestConfigs[K]['schema'] extends TSchema
          ? Static<RequestConfigs[K]['schema']>
          : string;
};

export type TPartialSome<TTSchema extends TSchema, K extends PropertyKey[]> = TComposite<
    [TOmit<TTSchema, K>, TPartial<TPick<TTSchema, K>>]
>;
