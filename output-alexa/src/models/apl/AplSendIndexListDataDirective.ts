import {
  Equals,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from '@jovotech/output';
import { AplIndexListDirective } from './AplIndexListDirective';

export class AplSendIndexListDataDirective extends AplIndexListDirective<'Alexa.Presentation.APL.SendIndexListData'> {
  @Equals('Alexa.Presentation.APL.SendIndexListData')
  type: 'Alexa.Presentation.APL.SendIndexListData';

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  correlationToken?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  listVersion?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  minimumInclusiveIndex?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  maximumExclusiveIndex?: string;

  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  items?: Record<string, unknown>[];
}
