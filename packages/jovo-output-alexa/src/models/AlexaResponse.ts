import { IsObject, IsOptional, IsSemVer, Type, ValidateNested } from 'jovo-output';
import { Response } from './Response';

export class AlexaResponse {
  [key: string]: unknown;

  @IsSemVer()
  version: string;

  @IsOptional()
  @IsObject()
  sessionAttributes?: Record<string, unknown>;

  @ValidateNested()
  @Type(() => Response)
  response: Response;
}
