import {
  registerDecorator,
  validate,
  ValidationArguments,
  ValidationError,
  ValidationOptions,
} from '../..';

export function IsClassOrString(
  classType: new () => any,
  options?: ValidationOptions,
): PropertyDecorator {
  return function (object: any, propertyKey: string | symbol) {
    registerDecorator({
      name: 'isClassOrString',
      target: object.constructor,
      propertyName: propertyKey.toString(),
      constraints: [classType],
      options,
      async: true,
      validator: {
        async validate(value: any, args: ValidationArguments) {
          if (typeof value === 'string' && value.length) {
            return true;
          } else if (value instanceof args.constraints[0]) {
            const errors = await validate(value);
            args.constraints[1] = errors;
            return !errors.length;
          }
          const error = new ValidationError();
          error.target = object;
          error.property = propertyKey.toString();
          error.value = value;
          error.constraints = {
            isValidMessage: `$property should either be a non-empty string or a valid ${args.constraints[0].name}-object`,
          };
          error.children = [];
          args.constraints[1] = [error];
          return false;
        },
        defaultMessage(args: ValidationArguments) {
          const errors: ValidationError[] = args.constraints[1];
          if (!errors?.length) {
            return `$property should either be a non-empty string or a valid ${args.constraints[0].name}-object`;
          }
          const errorText = errors
            .map((error) => {
              return Object.values(error.constraints || {});
            })
            .join(', ');
          return `$property is invalid: ${errorText}`;
        },
      },
    });
  };
}
