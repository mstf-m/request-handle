import { v4 as uuidv4 } from 'uuid';

// Helper function to generate numeric-only UUID
export const generateNumericUUID = () => {
  let id = parseInt(uuidv4().replace(/\D/g, '').substring(0, 12), 10);
  return id % 2 === 0 ? id : id + 1; // Ensure it's even
};

export interface RequestBody {
  message_id: number;
  token: string;
  device_id: string;
  version: number;
  body: { constructor: number; [key: string]: any };
}

export class Request {
  public message_id: number;
  public createdAt: number;
  public body: RequestBody;
  public onResponse: (data: any) => void;

  constructor(body: RequestBody, onResponse: (data: any) => void) {
    this.message_id = generateNumericUUID();
    this.createdAt = Date.now();
    this.body = { ...body, message_id: this.message_id };
    this.onResponse = onResponse;
  }

  isExpired(maxAge: number) {
    return Date.now() - this.createdAt > maxAge;
  }
}
