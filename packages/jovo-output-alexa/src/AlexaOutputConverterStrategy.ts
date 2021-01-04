import { GenericOutput, Message, OutputConverterStrategy, toSSML } from 'jovo-output';
import { AlexaResponse, OutputSpeech, OutputSpeechType, PlayBehavior } from './models';

export class AlexaOutputConverterStrategy implements OutputConverterStrategy<AlexaResponse> {
  responseClass = AlexaResponse;

  toResponse(output: GenericOutput): AlexaResponse {
    const response: AlexaResponse = {
      version: '1.0',
      response: {},
    };

    // TODO: fully determine when to set listen
    const listen = output.platforms?.Alexa?.listen ?? output.listen;
    if (typeof listen !== 'undefined') {
      response.response.shouldEndSession = !listen;
    }

    const message = output.platforms?.Alexa?.message || output.message;
    if (message) {
      response.response.outputSpeech = this.convertMessageToOutputSpeech(message);
    }

    const reprompt = output.platforms?.Alexa?.reprompt || output.reprompt;
    if (reprompt) {
      response.response.reprompt = {
        outputSpeech: this.convertMessageToOutputSpeech(reprompt),
      };
    }

    const card = output.platforms?.Alexa?.card || output.card;
    if (card) {
      response.response.card = card.toAlexaCard?.();
    }

    const responseKeys: Array<keyof AlexaResponse> = ['version', 'sessionAttributes', 'response'];

    // TODO: replace with merge or defaults
    for (const responseKey of responseKeys) {
      if (output.platforms?.Alexa?.[responseKey]) {
        response[responseKey] = output.platforms.Alexa[responseKey];
      }
    }

    return response;
  }

  fromResponse(response: AlexaResponse): GenericOutput {
    const output: GenericOutput = {};

    if (
      (response.response.outputSpeech?.text || response.response.outputSpeech?.ssml) &&
      response.response.outputSpeech?.toMessage
    ) {
      output.message = response.response.outputSpeech.toMessage();
    }

    if (
      (response.response.reprompt?.outputSpeech?.text ||
        response.response.reprompt?.outputSpeech?.ssml) &&
      response.response.reprompt?.outputSpeech?.toMessage
    ) {
      output.reprompt = response.response.reprompt.outputSpeech.toMessage();
    }

    if (typeof response.response.shouldEndSession === 'boolean') {
      output.listen = !response.response.shouldEndSession;
    }

    if (response.response.card?.toGenericCard) {
      output.card = response.response.card.toGenericCard();
    }

    return output;
  }

  convertMessageToOutputSpeech(message: Message): OutputSpeech {
    return typeof message === 'string'
      ? {
          type: OutputSpeechType.Ssml,
          ssml: toSSML(message),
          playBehavior: PlayBehavior.ReplaceEnqueued,
        }
      : message.toAlexaOutputSpeech?.() || {
          type: OutputSpeechType.Ssml,
          ssml: toSSML(message.text),
          playBehavior: PlayBehavior.ReplaceEnqueued,
        };
  }
}
