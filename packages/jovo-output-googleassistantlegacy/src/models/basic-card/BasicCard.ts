import {
  IsOptional,
  IsString,
  IsNotEmpty,
  Type,
  ValidateIf,
  IsEnum,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateNested,
  ConditionalMaxLength,
  GenericCard,
} from 'jovo-output';
import { Button } from '../common/Button';
import { Image } from '../common/Image';

export enum ImageDisplayOptions {
  Default = 'DEFAULT',
  White = 'WHITE',
  Cropped = 'CROPPED',
}

// TODO: set decorators
export class BasicCard {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  subtitle?: string;

  @ValidateIf((o) => o.formattedText || !o.image)
  @IsString()
  @IsNotEmpty()
  @ConditionalMaxLength<BasicCard>((o) => (o.image ? 500 : 750))
  formattedText?: string;

  @ValidateIf((o) => o.image || !o.formattedText)
  @ValidateNested()
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

  toGenericCard?(): GenericCard {
    const card: GenericCard = {
      title: (this.title || this.formattedText || this.subtitle) as string,
    };
    if (this.formattedText || this.subtitle) {
      card.subtitle = this.formattedText || this.subtitle;
    }
    if (this.image?.url) {
      card.imageUrl = this.image.url;
    }
    return card;
  }
}
