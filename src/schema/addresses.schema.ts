import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

interface Location {
  longitude: number;
  latitude: number;
}

@Schema({ collection: 'addresses' })
export class Addresses {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Object, required: true })
  location: Location;
}

export const AddressesSchema = SchemaFactory.createForClass(Addresses);

export type AddressesLeanDoc = Addresses & { _id: Types.ObjectId };
export type AddressesDoc = Addresses & Document;
