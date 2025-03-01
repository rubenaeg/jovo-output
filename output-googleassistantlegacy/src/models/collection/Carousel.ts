import {
  ArrayMaxSize,
  ArrayMinSize,
  Card,
  Carousel as BaseCarousel,
  IsArray,
  Type,
  ValidateNested,
} from '@jovotech/output';
import { CollectionItem } from './CollectionItem';

export class Carousel {
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => CollectionItem)
  items: CollectionItem[];

  toCarousel?(): BaseCarousel {
    return {
      items: this.items.map((item) => {
        const card: Card = {
          title: item.title,
        };
        if (item.optionInfo?.key) {
          card.key = item.optionInfo.key;
        }
        if (item.description) {
          card.subtitle = item.description;
        }
        if (item.image?.url) {
          card.imageUrl = item.image.url;
        }
        return card;
      }),
    };
  }
}
