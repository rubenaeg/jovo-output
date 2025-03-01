import {
  ArrayMaxSize,
  formatValidationErrors,
  Card,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsSomeValid,
  IsString,
  isString,
  Type,
  validate,
  ValidateNested,
} from '@jovotech/output';
import { Button } from '../common/Button';
import { Image } from '../common/Image';

export enum ImageDisplayOptions {
  Default = 'DEFAULT',
  White = 'WHITE',
  Cropped = 'CROPPED',
}

export class BasicCard {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  subtitle?: string;

  @IsSomeValid<BasicCard>({
    keys: ['formattedText', 'image'],
    validate: (value, args) => {
      if (!isString(value)) {
        return '$property must be a string';
      }
      if (!value) {
        return '$property should not be empty';
      }
      const maxLength = (args.object as BasicCard).image ? 500 : 750;
      if (value.length >= maxLength) {
        return `$property must be shorter than or equal to ${maxLength} characters`;
      }
      return;
    },
  })
  formattedText?: string;

  @IsSomeValid<BasicCard>({
    keys: ['formattedText', 'image'],
    validate: async (value, args) => {
      if (!(value instanceof Image)) {
        return `$property has to be an instance of Image`;
      }

      const errors = await validate(value);
      if (errors.length) {
        return formatValidationErrors(errors, {
          text: '$property is invalid:',
          delimiter: '\n  - ',
          path: '$property',
        });
      }
      return;
    },
  })
  @Type(() => Image)
  image?: Image;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(1)
  @ValidateNested({ each: true })
  @Type(() => Button)
  buttons?: [Button];

  @IsOptional()
  @IsEnum(ImageDisplayOptions)
  imageDisplayOptions?: ImageDisplayOptions;

  toCard?(): Card {
    const card: Card = {
      title: (this.title || this.formattedText || this.subtitle) as string,
    };
    if (this.subtitle) {
      card.subtitle = this.subtitle;
    }
    if (this.formattedText) {
      card.content = this.formattedText;
    }
    if (this.image?.url) {
      card.imageUrl = this.image.url;
    }
    return card;
  }
}
