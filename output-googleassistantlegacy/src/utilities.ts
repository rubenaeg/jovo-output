import { Card, Carousel, Message, QuickReply, toSSML } from '@jovotech/output';
import { BasicCard, CollectionItem, SimpleResponse } from './models';

export function augmentModelPrototypes(): void {
  Card.prototype.toGoogleAssistantBasicCard = function () {
    const basicCard: BasicCard = {
      title: this.title,
    };
    if (this.subtitle) {
      basicCard.subtitle = this.subtitle;
    }
    if (this.content) {
      basicCard.formattedText = this.content;
    }
    if (this.imageUrl) {
      basicCard.image = {
        url: this.imageUrl,
        accessibilityText: this.title,
      };
    }
    return basicCard;
  };

  Carousel.prototype.toGoogleAssistantCarousel = function () {
    return {
      items: this.items.map((item) => {
        const collectionItem: CollectionItem = {
          optionInfo: {
            key: item.key || item.title,
            synonyms: [],
          },
          title: item.title,
        };
        if (item.subtitle) {
          collectionItem.description = item.subtitle;
        }
        if (item.imageUrl) {
          collectionItem.image = {
            url: item.imageUrl,
            accessibilityText: item.title,
          };
        }
        return collectionItem;
      }),
    };
  };

  Message.prototype.toGoogleAssistantSimpleResponse = function () {
    const simpleResponse: SimpleResponse = {
      ssml: toSSML(this.text),
    };
    if (this.displayText) {
      simpleResponse.displayText = this.displayText;
    }
    return simpleResponse;
  };

  QuickReply.prototype.toGoogleAssistantSuggestion = function () {
    return {
      title: this.text,
    };
  };
}
