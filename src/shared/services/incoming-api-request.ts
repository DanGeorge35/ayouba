import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IIncomingApiRequestItems } from 'src/modules/database-module/schema/incoming-api-request-items';

@Injectable()
export class IncomingApiRequestService {
  constructor(
    @InjectModel('incoming_api_request_items')
    private readonly incomingApiRequestModel: Model<IIncomingApiRequestItems>,
  ) {}

  async logRequest(
    data: Partial<IIncomingApiRequestItems>,
  ): Promise<IIncomingApiRequestItems> {
    const requestLog = new this.incomingApiRequestModel(data);
    return await requestLog.save();
  }
}
