// types.ts
export interface RequestBody {
    constructor: number;
    [key: string]: any;
  }
  
  export interface RequestPayload {
    message_id: string;
    token: string;
    device_id: string;
    version: number;
    body: RequestBody;
  }
  
  export interface ResponsePayload {
    message_id: string;
    data: any; // adjust to actual data type
  }
  
  export interface AcknowledgePayload {
    message_id: string;
    response_ids: string[];
  }
  