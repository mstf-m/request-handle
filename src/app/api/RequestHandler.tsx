import { Request, RequestBody, ResponseBody, generateNumericUUID } from './Request';

export class RequestHandler {
  private static instance: RequestHandler;

  private pendingRequests: Request[] = [];
  private pendingResponses: Request[] = [];
  private pendingAcknowledge: Request[] = [];

  private POLL_INTERVAL = 5000; // 5 seconds
  private MAX_REQUEST_AGE = 30000; // 20 seconds
  private RESEND_INTERVAL = 20000; // 10 seconds
  private ACKNOWLEDGE_DELAY = 3000; // 3 seconds

  private acknowledgeTimeoutId: NodeJS.Timeout | null = null;

  private constructor() {
    this.startPolling();
    setInterval(() => this.resendExpiredRequests(), this.RESEND_INTERVAL);
  }

  public static getInstance(): RequestHandler {
    if (!RequestHandler.instance) {
      RequestHandler.instance = new RequestHandler();
    }
    return RequestHandler.instance;
  }

  public sendRequest(request: Request) {
    this.pendingRequests.push(request);
    this.processPendingRequests();
  }

  private async processPendingRequests() {
    for (const request of this.pendingRequests) {
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

      this.handleResponses(data.data.last_response);
    } catch (error) {
      console.error('Error polling for responses:', error);
    }
  }

  private async handleResponses(responses: ResponseBody[]) {
    if (responses) {
      for (const response of responses) {
        const matchingRequest = this.pendingResponses.find(
          (req) => req.message_id === response.message_id
        );

        if (matchingRequest) {
          matchingRequest.onResponse(response);
          this.pendingResponses = this.pendingResponses.filter(
            (req) => req.message_id !== response.message_id
          );
          matchingRequest.response_id = response.response_id
          this.pendingAcknowledge.push(matchingRequest);
          console.log(this.pendingAcknowledge, 'acks');
        }
      }
    }


    if (this.acknowledgeTimeoutId) {
      clearTimeout(this.acknowledgeTimeoutId);
      this.acknowledgeTimeoutId = null;
    }

    // Set a new timeout to acknowledge responses
    this.acknowledgeTimeoutId = setTimeout(() => {
      this.acknowledgeResponses();
      this.acknowledgeTimeoutId = null; // Clear the reference after execution
    }, this.ACKNOWLEDGE_DELAY);
  }

  private async acknowledgeResponses() {
    if (this.pendingAcknowledge.length === 0) return;

    const responseIds = this.pendingAcknowledge.map((req) => req.response_id);

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

  public async resendExpiredRequests() {
    for (const req of this.pendingRequests) {
      if (req.isExpired(this.MAX_REQUEST_AGE)) {
        try {
          await fetch('https://hijab.liara.run/home', {
            method: 'POST',
            headers: { 'Accept': 'application/json' },
            body: JSON.stringify(req.body),
          });
          this.moveToPendingResponses(req);
        } catch (error) {
          console.error('Failed to resend expired request:', error);
        }
      }
    }
  }

  public generateMessageId(): number {
    return generateNumericUUID();
  }
}
