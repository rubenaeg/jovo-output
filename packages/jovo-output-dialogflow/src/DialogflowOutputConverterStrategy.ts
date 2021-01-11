import _merge from 'lodash.merge';
import { GenericOutput, Message, OutputConverterStrategy, QuickReply } from 'jovo-output';
import { DialogflowResponse, Text } from './models';

export class DialogflowOutputConverterStrategy
  implements OutputConverterStrategy<DialogflowResponse> {
  responseClass = DialogflowResponse;

  toResponse(output: GenericOutput): DialogflowResponse {
    const response: DialogflowResponse = {};

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

  fromResponse(response: DialogflowResponse): GenericOutput {
    const output: GenericOutput = {};

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
      output.card = messageWithCard.message.card?.toGenericCard?.();
    }

    return output;
  }

  convertMessageToText(message: Message): Text {
    return typeof message === 'string'
      ? { text: [message] }
      : message.toDialogflowText?.() || {
          text: [message.displayText || message.text],
        };
  }

  convertQuickReplyToDialogflowQuickReply(quickReply: QuickReply): string {
    return typeof quickReply === 'string'
      ? quickReply
      : quickReply.toDialogflowQuickReply?.() || quickReply.value || quickReply.text;
  }
}
