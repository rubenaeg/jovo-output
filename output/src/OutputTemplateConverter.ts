import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { JovoResponse, OutputTemplate, OutputTemplateConverterStrategy } from '.';
import { OutputValidationError } from './errors/OutputValidationError';

// TODO: check if validation should happen before and after conversion
export class OutputTemplateConverter<RESPONSE extends JovoResponse> {
  constructor(public strategy: OutputTemplateConverterStrategy<RESPONSE>) {}

  async validateOutput(output: OutputTemplate | OutputTemplate[]): Promise<ValidationError[]> {
    return this.validate(output, OutputTemplate);
  }

  async validateResponse(response: RESPONSE | RESPONSE[]): Promise<ValidationError[]> {
    return this.validate(response, this.strategy.responseClass);
  }

  async toResponse(output: OutputTemplate | OutputTemplate[]): Promise<RESPONSE | RESPONSE[]> {
    const instancedOutput: OutputTemplate | OutputTemplate[] = plainToClass(OutputTemplate, output);
    let errors = await this.validateOutput(instancedOutput);
    if (errors.length) {
      throw new OutputValidationError(errors, 'Can not convert.\n');
    }
    const response = this.strategy.toResponse(instancedOutput);
    errors = await this.validateResponse(response);
    if (errors.length) {
      throw new OutputValidationError(errors, 'Conversion caused invalid response.\n');
    }
    return response;
  }

  async fromResponse(response: RESPONSE | RESPONSE[]): Promise<OutputTemplate | OutputTemplate[]> {
    const responseInstance = plainToClass(this.strategy.responseClass, response);
    let errors = await this.validateResponse(responseInstance);
    if (errors.length) {
      throw new OutputValidationError(errors, 'Can not parse.\n');
    }
    const output = this.strategy.fromResponse(responseInstance);
    errors = await this.validateOutput(output);
    if (errors.length) {
      throw new OutputValidationError(errors, 'Conversion caused invalid output.\n');
    }
    return output;
  }

  private async validate<T = unknown>(
    objOrArray: T | T[],
    targetClass: new (...args: unknown[]) => T,
  ): Promise<ValidationError[]> {
    const getInstance = (item: T) =>
      // eslint-disable-next-line @typescript-eslint/ban-types
      (item instanceof targetClass ? item : plainToClass(targetClass, item)) as unknown as object;
    if (Array.isArray(objOrArray)) {
      const errorMatrix = await Promise.all(objOrArray.map((item) => validate(getInstance(item))));
      // TODO: maybe modify key or something to indicate better which item was invalid
      return errorMatrix.reduce((acc, curr) => {
        acc.push(...curr);
        return acc;
      }, []);
    } else {
      return validate(getInstance(objOrArray));
    }
  }
}
