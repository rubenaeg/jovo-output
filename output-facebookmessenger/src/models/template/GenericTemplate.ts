import {
  ArrayMaxSize,
  Card,
  Carousel,
  Equals,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Type,
  ValidateNested,
} from '@jovotech/output';
import { TransformButton } from '../../decorators/transformation/TransformButton';
import { Button } from '../button/Button';
import { WebViewHeightRatio } from '../button/LinkButton';
import { Template, TemplateType } from './Template';

export enum ImageAspectRatio {
  Horizontal = 'horizontal',
  Square = 'square',
}

export class GenericTemplateDefaultAction {
  @IsUrl()
  url: string;

  @IsOptional()
  @IsEnum(WebViewHeightRatio)
  webview_height_ratio?: WebViewHeightRatio;

  @IsOptional()
  @IsBoolean()
  messenger_extensions?: boolean;

  @IsOptional()
  @IsUrl()
  fallback_url?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  webview_share_button?: string | 'hide';
}

export class GenericTemplateElement {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  title: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  subtitle?: string;

  @IsOptional()
  @IsUrl()
  image_url?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => GenericTemplateDefaultAction)
  default_action?: GenericTemplateDefaultAction;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  @ValidateNested({ each: true })
  @TransformButton()
  buttons?: Button[];

  toCard?(): Card {
    const card: Card = {
      title: this.title,
    };
    if (this.subtitle) {
      card.subtitle = this.subtitle;
    }
    if (this.image_url) {
      card.imageUrl = this.image_url;
    }
    return card;
  }
}

export class GenericTemplate extends Template<TemplateType.Generic> {
  @Equals(TemplateType.Generic)
  template_type: TemplateType.Generic;

  @IsOptional()
  @IsEnum(ImageAspectRatio)
  image_aspect_ratio?: ImageAspectRatio;

  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => GenericTemplateElement)
  elements: GenericTemplateElement[];

  toCarousel?(): Carousel {
    return {
      items: this.elements.map((element) => element.toCard!()),
    };
  }
}
