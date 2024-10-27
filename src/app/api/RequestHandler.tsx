import { Request, RequestBody, ResponseBody, generateNumericUUID } from './Request';

export class RequestHandler {
  private static instance: RequestHandler;

  private pendingRequests: Request[] = [];
  private pendingResponses: Request[] = [];
  private pendingAcknowledge: Request[] = [];

  private POLL_INTERVAL = 5000;
  private MAX_REQUEST_AGE = 30000;

  private constructor() {
    this.startPolling();
  }

  public static getInstance(): RequestHandler {
    if (!RequestHandler.instance) {
      RequestHandler.instance = new RequestHandler();
    }
    return RequestHandler.instance;
  }

  public sendRequest(request: Request) {
    this.pendingRequests.push(request);
    this.processRequest(request);
  }

  private async processRequest(request: Request) {
    try {
      await fetch('https://hijab.liara.run/home', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: JSON.stringify(request.body),
      });
      this.moveToPendingResponses(request);
    } catch (error) {
      console.error('Failed to send request:', error);
    }
  }

  private startPolling() {
    setInterval(() => this.pollForResponses(), this.POLL_INTERVAL);
  }

  private async pollForResponses() {
    try {
      const response = await fetch('https://hijab.liara.run/home', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: JSON.stringify({
          message_id: this.generateMessageId(),
          token: 'none',
          device_id: 'IOS_2525225',
          version: 1,
          body: { constructor: 300 },
        }),
      });
  
      if (!response.ok) {
        console.error(`Server returned status ${response.status}`);
        return;
      }
  
      const data = await response.json();
  
      if (!data?.data?.last_response) {
        console.warn("No 'last_response' in data:", data);
        return; // Exit if 'last_response' is undefined
      }
  
      console.log("last-response", data.data.last_response); // Keep original logging
      this
      
      .handleResponses(data.data.last_response);
    } catch (error) {
      console.error('Error polling for responses:', error);
    }
  }
  

  private handleResponses(responses: ResponseBody[]) {
    if (responses) {
      responses.forEach((response) => {
        const matchingRequest = this.pendingResponses.find(
          (req) => req.message_id === response.message_id
        );


        if (matchingRequest) {
          matchingRequest.onResponse(response);
          this.pendingResponses = this.pendingResponses.filter(
            (req) => req.message_id !== response.message_id
          );
          this.pendingAcknowledge.push(matchingRequest);
          console.log(  this.pendingAcknowledge, 'acks');
        }
      });
    }

    this.acknowledgeResponses();
  }

  private async acknowledgeResponses() {
    if (this.pendingAcknowledge.length === 0) return;

    const responseIds = this.pendingAcknowledge.map((req) => req.message_id);

    try {
      await fetch('https://hijab.liara.run/home', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: JSON.stringify({
          message_id: generateNumericUUID(),
          token: 'none',
          device_id: 'IOS_2525225',
          version: 1,
          body: { constructor: 301, response_ids: responseIds },
        }),
      });

      this.pendingAcknowledge = [];
    } catch (error) {
      console.error('Failed to acknowledge responses:', error);
    }
  }

  private moveToPendingResponses(request: Request) {
    this.pendingRequests = this.pendingRequests.filter(
      (req) => req.message_id !== request.message_id
    );
    this.pendingResponses.push(request);
  }

  public cleanupExpiredRequests() {
    this.pendingRequests = this.pendingRequests.filter(
      (req) => !req.isExpired(this.MAX_REQUEST_AGE)
    );
    this.pendingResponses = this.pendingResponses.filter(
      (req) => !req.isExpired(this.MAX_REQUEST_AGE)
    );
  }

  // Generate numeric-only UUID (exposed for other classes like LoginRequest)
  public generateMessageId(): number {
    return generateNumericUUID();
  }
}
