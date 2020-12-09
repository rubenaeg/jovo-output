import {
  decoratePropertyOfGenericOutput,
  GenericCard,
  GenericCarousel,
  GenericMessage,
  GenericQuickReply,
  toSSML,
} from 'jovo-output';
import {
  BasicCard,
  Carousel,
  CollectionItem,
  GoogleAssistantOutput,
  SimpleResponse,
  Suggestion,
} from './models';

declare module 'jovo-output/dist/models/GenericCard' {
  interface GenericCard {
    toGoogleAssistantBasicCard?(): BasicCard;
  }
}

declare module 'jovo-output/dist/models/GenericCarousel' {
  interface GenericCarousel {
    toGoogleAssistantCarousel?(): Carousel;
  }
}

declare module 'jovo-output/dist/models/GenericMessage' {
  interface GenericMessage {
    toGoogleAssistantSimpleResponse?(): SimpleResponse;
  }
}

declare module 'jovo-output/dist/models/GenericQuickReply' {
  interface GenericQuickReply {
    toGoogleAssistantSuggestion?(): Suggestion;
  }
}

function augmentPrototypes() {
  GenericCard.prototype.toGoogleAssistantBasicCard = function () {
    const basicCard: BasicCard = {
      title: this.title,
      formattedText: this.subtitle,
    };
    if (this.imageUrl) {
      basicCard.image = {
        url: this.imageUrl,
        accessibilityText: this.title,
      };
    }
    return basicCard;
  };

  GenericCarousel.prototype.toGoogleAssistantCarousel = function () {
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

  GenericMessage.prototype.toGoogleAssistantSimpleResponse = function () {
    const simpleResponse: SimpleResponse = {
      ssml: toSSML(this.text),
    };
    if (this.displayText) {
      simpleResponse.displayText = this.displayText;
    }
    return simpleResponse;
  };

  GenericQuickReply.prototype.toGoogleAssistantSuggestion = function () {
    return {
      title: this.text,
    };
  };
}

// augment the prototypes of the generic models to have methods to convert to the GoogleAssistant-variant
augmentPrototypes();

// Make GoogleAssistantOutput available for the GenericOutput-object via the GoogleAssistant-key.
declare module 'jovo-output/dist/models/GenericOutput' {
  interface GenericOutput {
    GoogleAssistant?: GoogleAssistantOutput;
  }
}
// Additionally, make class-validator and class-transformer aware of the added property.
decoratePropertyOfGenericOutput('GoogleAssistant', GoogleAssistantOutput);

export * from './validation/decorators/IsValidLineItemExtension';
export * from './validation/decorators/IsValidMediaObjectImage';
export * from './validation/decorators/IsValidOrderExtension';
export * from './validation/decorators/IsValidPaymentResultString';
export * from './validation/decorators/IsValidRichResponseItemArray';
export * from './validation/decorators/IsValidRichResponseItemObject';
export * from './validation/decorators/IsValidSimpleResponseString';

export * from './models';

export * from './GoogleAssistantOutputConverterStrategy';
