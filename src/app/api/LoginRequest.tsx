import { Request } from './Request';
import { RequestHandler } from './RequestHandler';

export class LoginRequest {
  public static send(mobile: string, onResponse: (data: any) => void) {
    const requestHandler = RequestHandler.getInstance(); // Get singleton instance
    const requestBody = {
      token: 'none',
      
      device_id: 'IOS_2525225',
      version: 1,
      body: { constructor: 600, mobile },
    };

    const request = new Request(requestBody, onResponse);
    requestHandler.sendRequest(request);
  }
}
