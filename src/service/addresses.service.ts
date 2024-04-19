  import { Injectable } from '@nestjs/common';
  import { Model } from 'mongoose';
  import { InjectModel } from '@nestjs/mongoose';
  import { Addresses, AddressesDoc } from '../schema';



  @Injectable()
  export class AddressesService{
      constructor(
          @InjectModel(Addresses.name)
          private readonly addressModel: Model<AddressesDoc>,
        ) {}
        async findAddresses(address: string): Promise<AddressesDoc | null> {
          const foundAddress = await this.addressModel.findOne({ name: address }).exec();
      return foundAddress;
        }
    
      
  }