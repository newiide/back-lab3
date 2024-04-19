  import { Injectable } from '@nestjs/common';
  import { Model } from 'mongoose';
  import { InjectModel } from '@nestjs/mongoose';
  import { Addresses, AddressesDoc } from '../schema';
  import { BadRequestException } from '@nestjs/common';

  @Injectable()
export class AddressesService {
  constructor(
    @InjectModel(Addresses.name) private readonly addressModel: Model<AddressesDoc>,
  ) {}

  async createAddress(addressDto: any): Promise<AddressesDoc> {
    if (!addressDto.location) {
      throw new BadRequestException('Location is required');
    }
    
    const newAddress = new this.addressModel(addressDto);
    return newAddress.save();
  }
}
