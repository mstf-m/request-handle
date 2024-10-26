// Types for the request and response structures
interface RequestBody {
  message_id: string;
  token: string;
  device_id: string;
  version: number;
  body: {
    constructor: number;
    [key: string]: any;
  };
}

interface ResponseBody {
  constructor: number;
  response_data: any;
}

interface PendingRequest {
  id: string;
  onResponse: (data: ResponseBody) => void;
}

class RequestHandler {
  private static instance: RequestHandler;
  private pendingRequests: any[] = [];
  private pendingAcks: string[] = [];

  private constructor() {
    this.startPolling();
  }

  // Ensure singleton instance
  public static getInstance(): RequestHandler {
    if (!RequestHandler.instance) {
      RequestHandler.instance = new RequestHandler();
    }
    return RequestHandler.instance;
  }

  // Method to send a request and add it to the pending queue
  public sendRequest(requestBody: RequestBody, onResponse: (data: ResponseBody) => void) {
    const { message_id } = requestBody;
    this.pendingRequests.push({ id: message_id, onResponse: onResponse })
    console.log(this.pendingRequests, "pendingRequests")
    this.pollForResponses()

    fetch('https://hijab.liara.run/home', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',

      },
      body: JSON.stringify(requestBody),
    }).catch(error => console.error('Failed to send request:', error));
  }

  // Polling method to check for responses every 5 seconds
  private startPolling() {
    // setInterval(() => this.pollForResponses(), 5000);
    this.pollForResponses()
  }

  // Poll for any new responses
  private async pollForResponses() {
    try {
      const response = await fetch('https://hijab.liara.run/home', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',

        },
        body: JSON.stringify({
          message_id: this.generateMessageId(),
          token: 'none',
          device_id: 'IOS_2525225',
          version: 1,
          body: { constructor: 300 },
        }),
      });

      const data: ResponseBody[] = await response.json();
      console.log(data.data.last_response,"last-responses")
      this.handleResponses(data.data.last_response);
    } catch (error) {
      console.error('Error polling for responses:', error);
    }
  }

  // Handle incoming responses and match them to pending requests
  private handleResponses(responses: ResponseBody[]) {
    responses.forEach((response) => {
      const requestIndex = this.pendingRequests.findIndex(
        req => req.id === response.message_id.toString()
      );
      
  
      if (requestIndex !== -1) {
        const request = this.pendingRequests[requestIndex];
        request.onResponse(response);
        this.pendingAcks.push(response.response_id); // Add to pending acks
        console.log(this.pendingAcks,"pendingAcks");
        // Remove the request from the pendingRequests array
        this.pendingRequests.splice(requestIndex, 1);
      }
    });
    this.acknowledgeResponses();
  }

  // Acknowledge responses to the server
  private async acknowledgeResponses() {
    if (this.pendingAcks.length === 0) return;
   

    const ackRequest = {
      message_id: this.generateMessageId(),
      token: 'none',
      device_id: 'IOS_2525225',
      version: 1,
      body: {
        constructor: 301,
        response_ids: [...this.pendingAcks],
      },
    };

    try {
      await fetch('https://hijab.liara.run/home', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: JSON.stringify(ackRequest),
      });
      this.pendingAcks = [];
      this.pollForResponses()
    } catch (error) {
      console.error('Failed to acknowledge responses:', error);
    }
  }

  // Utility method to generate unique message IDs
  public generateMessageId(): string {
    return "12222"
  }
}

export default RequestHandler.getInstance();
