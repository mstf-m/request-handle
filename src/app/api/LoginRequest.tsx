import RequestHandler from './RequestHandler';

export default class LoginRequest {
  public static send(mobile: string, onResponse: (data: any) => void) {
    const requestBody = {
      message_id: RequestHandler.generateMessageId(),
      token: 'none',
      device_id: 'IOS_2525225',
      version: 1,
      body: {
        constructor: 600,
        mobile,
      },
    };

    RequestHandler.sendRequest(requestBody, onResponse);
  }
}
