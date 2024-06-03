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
    TRequestSchema extends TSchema,
    TResponseSchema extends TSchema,
    ResponseConfig extends ResponseValidatorConfig<TResponseSchema> = ResponseValidatorConfig<TResponseSchema>,
    RequestConfigs extends RequestValidatorConfig<TRequestSchema>[] = RequestValidatorConfig<TRequestSchema>[],
> extends Omit<ApiOperationOptions, 'requestBody' | 'parameters'> {
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
    responseCode?: number;
    path?: string;
    validate?: ValidatorConfig<TRequestSchema, TResponseSchema, ResponseConfig, RequestConfigs>;
}

export interface SchemaValidator<TRequestSchema extends TSchema, TResponseSchema extends TSchema> {
    schema: TRequestSchema | TResponseSchema;
    name: string;
    check: ValidateFunction<Static<TRequestSchema | TResponseSchema>>;
    validate(data: Obj | Obj[]): Static<TRequestSchema | TResponseSchema>;
}
export interface ValidatorConfigBase<TTSchema extends TSchema> {
    schema?: TTSchema;
    coerceTypes?: boolean;
    stripUnknownProps?: boolean;
    name?: string;
    required?: boolean;
    pipes?: (PipeTransform | Type<PipeTransform>)[];
}
export interface ResponseValidatorConfig<TResponseSchema extends TSchema> extends ValidatorConfigBase<TResponseSchema> {
    schema: TResponseSchema;
    type?: 'response';
    responseCode?: number;
    required?: true;
    pipes?: never;
}

export interface ParamValidatorConfig<TRequestSchema extends TSchema> extends ValidatorConfigBase<TRequestSchema> {
    schema?: TRequestSchema;
    type: 'param';
    name: string;
    stripUnknownProps?: never;
}

export interface QueryValidatorConfig<TRequestSchema extends TSchema> extends ValidatorConfigBase<TRequestSchema> {
    schema?: TRequestSchema;
    type: 'query';
    name: string;
    stripUnknownProps?: never;
}

export interface BodyValidatorConfig<TRequestSchema extends TSchema> extends ValidatorConfigBase<TRequestSchema> {
    schema: TRequestSchema;
    type: 'body';
}

export type RequestValidatorConfig<TRequestSchema extends TSchema> =
    | ParamValidatorConfig<TRequestSchema>
    | QueryValidatorConfig<TRequestSchema>
    | BodyValidatorConfig<TRequestSchema>;
export type SchemaValidatorConfig<TRequestSchema extends TSchema, TResponseSchema extends TSchema> =
    | RequestValidatorConfig<TRequestSchema>
    | ResponseValidatorConfig<TResponseSchema>;

export type ValidatorType<TRequestSchema extends TSchema, TResponseSchema extends TSchema> = NonNullable<
    SchemaValidatorConfig<TRequestSchema, TResponseSchema>['type']
>;

export interface ValidatorConfig<
    TRequestSchema extends TSchema,
    TResponseSchema extends TSchema,
    ResponseConfig extends ResponseValidatorConfig<TResponseSchema>,
    RequestConfigs extends RequestValidatorConfig<TRequestSchema>[],
> {
    response?: TResponseSchema | ResponseConfig;
    request?: [...RequestConfigs];
}

export type RequestConfigsToTypes<TRequestSchema extends TSchema, RequestConfigs extends RequestValidatorConfig<TRequestSchema>[]> = {
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
