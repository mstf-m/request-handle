import { v4 as uuidv4 } from 'uuid';

export const generateNumericUUID = () => {
  let id = parseInt(uuidv4().replace(/\D/g, '').substring(0, 12), 10);
  return id % 2 === 0 ? id : id + 1; // Ensure it's even
};

export interface RequestBody {
  message_id: number;
  token: string;
  device_id: string;
  version: number;
  body: {
    constructor: number;
    [key: string]: any;
  };
}

export interface ResponseBody {
  message_id: number;
  response_id: number;
  response_data: any;
}

export class Request {
  public message_id: number;
  public response_id: number | null;
  public createdAt: number;
  public body: RequestBody;
  public onResponse: (data: ResponseBody) => void;

  constructor(body: Omit<RequestBody, 'message_id'>, onResponse: (data: ResponseBody) => void) {
    this.message_id = generateNumericUUID();
    this.response_id = null;
    this.createdAt = Date.now();
    this.body = { ...body, message_id: this.message_id };
    this.onResponse = onResponse;
  }

  isExpired(maxAge: number) {
    return Date.now() - this.createdAt > maxAge;
  }
}
