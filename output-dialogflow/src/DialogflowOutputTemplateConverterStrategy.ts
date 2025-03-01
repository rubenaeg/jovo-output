import {
  DynamicEntitiesMode,
  DynamicEntity,
  MessageValue,
  OutputTemplate,
  QuickReplyValue,
  SingleResponseOutputTemplateConverterStrategy,
} from '@jovotech/output';
import _merge from 'lodash.merge';
import {
  DialogflowResponse,
  EntityOverrideMode,
  EntityOverrideModeLike,
  SessionEntityType,
  Text,
} from './models';

// TODO CHECK: Theoretically, multiple messages are supported in the response, in the future this could be refactored for that.
export class DialogflowOutputTemplateConverterStrategy extends SingleResponseOutputTemplateConverterStrategy<DialogflowResponse> {
  platformName = 'Dialogflow';
  responseClass = DialogflowResponse;

  buildResponse(output: OutputTemplate): DialogflowResponse {
    const response: DialogflowResponse = {};

    const listen = output.platforms?.Dialogflow?.listen ?? output.listen;
    if (typeof listen === 'object' && listen.entities?.types?.length) {
      const entityOverrideMode: EntityOverrideMode =
        listen.entities.mode === DynamicEntitiesMode.Merge
          ? EntityOverrideMode.Supplement
          : EntityOverrideMode.Override;
      response.session_entity_types = listen.entities.types.map((entity) =>
        this.convertDynamicEntityToSessionEntityType(entity, entityOverrideMode),
      );
    }

    const message = output.platforms?.Dialogflow?.message || output.message;
    if (message) {
      if (!response.fulfillment_messages) {
        response.fulfillment_messages = [];
      }
      response.fulfillment_messages.push({
        message: {
          text: this.convertMessageToText(message),
        },
      });
    }

    const quickReplies = output.platforms?.Dialogflow?.quickReplies || output.quickReplies;
    if (quickReplies?.length) {
      if (!response.fulfillment_messages) {
        response.fulfillment_messages = [];
      }
      response.fulfillment_messages.push({
        message: {
          quick_replies: {
            quick_replies: quickReplies.map(this.convertQuickReplyToDialogflowQuickReply),
          },
        },
      });
    }

    const card = output.platforms?.Dialogflow?.card || output.card;
    if (card) {
      if (!response.fulfillment_messages) {
        response.fulfillment_messages = [];
      }
      response.fulfillment_messages.push({
        message: {
          card: card.toDialogflowCard!(),
        },
      });
    }

    if (output.platforms?.Dialogflow?.nativeResponse) {
      _merge(response, output.platforms.Dialogflow.nativeResponse);
    }

    return response;
  }

  fromResponse(response: DialogflowResponse): OutputTemplate {
    const output: OutputTemplate = {};

    const messageWithText = response.fulfillment_messages?.find((message) => message.message.text);
    if (messageWithText) {
      output.message = messageWithText.message.text?.toMessage?.();
    }

    const messageWithQuickReplies = response.fulfillment_messages?.find(
      (message) => message.message.quick_replies,
    );
    if (messageWithQuickReplies?.message?.quick_replies?.quick_replies?.length) {
      output.quickReplies = messageWithQuickReplies.message.quick_replies.quick_replies;
    }

    const messageWithCard = response.fulfillment_messages?.find((message) => message.message.card);
    if (messageWithCard) {
      output.card = messageWithCard.message.card?.toCard?.();
    }

    if (response.session_entity_types?.length) {
      const mode =
        response.session_entity_types[0].entity_override_mode === EntityOverrideMode.Supplement
          ? DynamicEntitiesMode.Merge
          : DynamicEntitiesMode.Replace;
      output.listen = {
        entities: {
          mode,
          types: response.session_entity_types.map(this.convertSessionEntityTypeToDynamicEntity),
        },
      };
    }

    return output;
  }

  convertMessageToText(message: MessageValue): Text {
    return typeof message === 'string'
      ? { text: [message] }
      : message.toDialogflowText?.() || {
          text: [message.displayText || message.text],
        };
  }

  convertQuickReplyToDialogflowQuickReply(quickReply: QuickReplyValue): string {
    return typeof quickReply === 'string'
      ? quickReply
      : quickReply.toDialogflowQuickReply?.() || quickReply.value || quickReply.text;
  }

  private convertDynamicEntityToSessionEntityType(
    entity: DynamicEntity,
    entityOverrideMode: EntityOverrideModeLike,
  ): SessionEntityType {
    // name usually is a whole path that even includes the session-id, we will have to figure something out for that, but it should not be too complicated.
    return {
      name: entity.name,
      entity_override_mode: entityOverrideMode,
      entities: (entity.values || []).map((entityValue) => ({
        value: entityValue.id || entityValue.value,
        // at least one synonym
        synonyms: [entityValue.value, ...(entityValue.synonyms?.slice() || [])],
      })),
    };
  }

  private convertSessionEntityTypeToDynamicEntity(
    sessionEntityType: SessionEntityType,
  ): DynamicEntity {
    return {
      name: sessionEntityType.name,
      values: sessionEntityType.entities.map((entity) => ({
        id: entity.value,
        value: entity.value,
        synonyms: entity.synonyms.slice(),
      })),
    };
  }
}
