import configuration from 'src/libs/configuration';
import { AxiosHelper } from '../helpers';
import { Helpers } from 'src/shared';
import { Logger } from '@nestjs/common';

const config = configuration();

export interface ErrorLogDetails {
  filePath: string;
  lineNumber: number;
  methodName: string;
  responseCode: string;
  stackTrace: string;
  status: string;
  errorMessage: string;
  endpointUrl: string;
  ipAddress: string;
  formattedRequestBody: string;
  formatteduserType: string;
}

export function extractErrorLogDetails(
  error,
  endpointUrl: string,
  request,
): ErrorLogDetails | null {
  const trace = error.stack ? error.stack.split('\n') : [];

  const stackTraceRegex = /at\s+(.*)\s+\((.*):(\d+):\d+\)/;

  let filePath = 'Unknown file';
  let lineNumber = 0;
  let methodName = 'Unknown method';

  for (const line of trace) {
    const match = line.match(stackTraceRegex);
    if (match) {
      methodName = match[1].split('.').pop() || methodName;
      filePath = match[2];
      lineNumber = parseInt(match[3], 10);
      break;
    }
  }

  const responseCode = error.responseCode || 'Unknown code';
  const status = error.responseBody?.status || 'Unknown status';
  const errorMessage =
    error.responseBody?.message || error.message || 'No error message';
  const formattedRequestBody = error.requestBody || 'No request body';
  const formatteduserType = error.userType || 'No user type';

  return {
    filePath,
    lineNumber,
    methodName,
    responseCode,
    status,
    stackTrace: error.stack ? error.stack : '',
    errorMessage,
    endpointUrl,
    ipAddress: Helpers.getClientIp(request),
    formattedRequestBody,
    formatteduserType,
  };
}

export interface ISlackErrorMessage {
  title: string;
  messageBody: ErrorLogDetails;
}

export interface ISlackLogMessage {
  title: string;
  body;
}

export class SlackNotifier {
  private readonly logger = new Logger(SlackNotifier.name);
  private messageError: ISlackErrorMessage;

  constructor() {}
  public async notifyError(message: ISlackErrorMessage) {
    this.messageError = message;

    const headers = {
      'Content-Type': 'application/json',
    };

    const postMessage = {
      text: `*Error Notification: ${this.messageError.title}*`,
      attachments: [
        {
          color: '#FF0000',
          blocks: [
            {
              type: 'section',
              fields: [
                {
                  type: 'mrkdwn',
                  text: `*Error Title:* ${this.messageError.title}\n\n`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Request Path:* ${this.messageError.messageBody.endpointUrl}\n\n`,
                },
              ],
            },
            {
              type: 'section',
              fields: [
                {
                  type: 'mrkdwn',
                  text: `*File Path:*\n${this.messageError.messageBody.filePath}\n\n`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Line Number:*\n${this.messageError.messageBody.lineNumber}\n\n`,
                },
                {
                  type: 'mrkdwn',
                  text: `*--:*\n--\n\n`,
                },
              ],
            },
            {
              type: 'section',
              fields: [
                {
                  type: 'mrkdwn',
                  text: `*Method Name:*\n${this.messageError.messageBody.methodName}\n\n`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Response Code:*\n${this.messageError.messageBody.responseCode}\n\n`,
                },
              ],
            },
            {
              type: 'section',
              fields: [
                {
                  type: 'mrkdwn',
                  text: `*Status:*\n${this.messageError.messageBody.status}\n\n`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Error Message:*\n${this.messageError.messageBody.errorMessage}\n\n`,
                },
              ],
            },
            {
              type: 'section',
              fields: [
                {
                  type: 'mrkdwn',
                  text: `*Request Body:*\n${this.messageError.messageBody.formattedRequestBody}`,
                },
                {
                  type: 'mrkdwn',
                  text: `*User Type:*\n${this.messageError.messageBody.formatteduserType}`,
                },
              ],
            },
            {
              type: 'section',
              fields: [
                {
                  type: 'mrkdwn',
                  text: `*IP ADDRESS:*\n${this.messageError.messageBody.ipAddress}\n\n`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Stack Trace:*\n${this.messageError.messageBody.stackTrace}\n\n`,
                },
              ],
            },
            {
              type: 'context',
              elements: [
                {
                  type: 'mrkdwn',
                  text: 'Reported by iRecharge system',
                },
              ],
            },
          ],
        },
      ],
    };

    const url = config.slack_channel.url;

    try {
      await AxiosHelper.sendPostRequest(postMessage, url, headers);
    } catch (error) {
      this.logger.error(error);
    }
  }

  public async notifyLog(message: ISlackLogMessage) {
    const headers = {
      'Content-Type': 'application/json',
    };

    const environment = config.app.debug
      ? 'DEVELOPMENT ENVIRONMENT'
      : 'STAGING ENVIRONMENT';

    const postMessage = {
      text: `*[${environment}] - Error Notification: ${message.title}*`,
      attachments: [
        {
          color: '#03a9f4',
          blocks: [
            {
              type: 'section',
              fields: [
                {
                  type: 'mrkdwn',
                  text: `*Error Title:* ${message.title}\n\n`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Request Path:* ${message.body}\n\n`,
                },
              ],
            },

            {
              type: 'context',
              elements: [
                {
                  type: 'mrkdwn',
                  text: 'Reported by iRecharge system',
                },
              ],
            },
          ],
        },
      ],
    };

    const url = config.slack_channel.url;

    try {
      await AxiosHelper.sendPostRequest(postMessage, url, headers);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
