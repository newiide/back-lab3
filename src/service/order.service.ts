import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderDto } from '../models';
import { Orders, OrdersDoc } from '../schema';
import { AddressesService } from './addresses.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Orders.name) private readonly orderModel: Model<OrdersDoc>,
    private readonly addressesService: AddressesService,
  ) {}

  async createOrder(body: OrderDto & { login: string }): Promise<OrdersDoc> {
    
    const fromAddress = await this.addressesService.createAddress(body.from);
    const toAddress = await this.addressesService.createAddress(body.to);

    const distance = this.calculateDistance(fromAddress.location, toAddress.location);
    const price = this.determinePrice(body.type, distance);

    const orderData = new this.orderModel({
      ...body,
      from: fromAddress._id, 
      to: toAddress._id,     
      status: 'Active',
      distance,
      price,
    });

    await orderData.save();
    return orderData.toObject();
  }

  
  calculateDistance(fromLoc, toLoc): number {
    const rad = Math.PI / 180;
    const dLat = rad * (toLoc.latitude - fromLoc.latitude);
    const dLon = rad * (toLoc.longitude - fromLoc.longitude);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad * fromLoc.latitude) * Math.cos(rad * toLoc.latitude) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return 6371 * c; 
  }

  determinePrice(type: string, distance: number): number {
    const rate = { standard: 2.5, lite: 1.5, universal: 3 }[type];
    if (!rate) throw new BadRequestException('Invalid order type');
    return rate * distance;
  }

  async getOrders(userLogin: string, userRole: string): Promise<OrdersDoc[]> {
    let query = this.orderModel.find();

    if (userRole === 'Driver') {
      query = query.where('status', 'Active');
    } else if (userRole !== 'Admin') {
      query = query.where('login', userLogin);
    }

    return query.exec();
  }

  async updateOrderStatus(orderId: string, newStatus: string, userRole: string): Promise<{ message: string }> {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new BadRequestException('Order not found');
    if (order.status === 'Done') throw new BadRequestException('Cannot change status from Done');

    const validStatusChanges = {
      Customer: ['Rejected'],
      Driver: ['In progress', 'Done'],
      Admin: ['Rejected', 'In progress', 'Done'],
    };

    if (order.status === 'Active' && validStatusChanges[userRole].includes(newStatus)) {
      order.status = newStatus;
      await order.save();
      return { message: 'Order status updated successfully' };
    }

    throw new BadRequestException('Invalid status update attempt');
  }

  async getRecentFromAddresses(userLogin: string): Promise<string[]> {
    return this.getRecentAddresses(userLogin, 'from', 5);
  }

  async getRecentToAddresses(userLogin: string): Promise<string[]> {
    return this.getRecentAddresses(userLogin, 'to', 3);
  }

  async getRecentAddresses(login: string, addressType: 'from' | 'to', limit: number): Promise<string[]> {
    const orders = await this.orderModel.find({ login }, { [addressType]: 1, _id: 0 }).sort({ _id: -1 }).limit(limit);
    return Array.from(new Set(orders.map(order => order[addressType])));
  }

  async getLowestPrice(login: string): Promise<OrderDto | null> {
    const orders = await this.orderModel.find({ login });
    if (orders.length === 0) return null;
    return orders.reduce((lowest, order) => order.price < lowest.price ? order : lowest).toObject();
  }

  async getBiggestPrice(login: string): Promise<OrderDto | null> {
    const orders = await this.orderModel.find({ login });
    if (orders.length === 0) return null;
    return orders.reduce((highest, order) => order.price > highest.price ? order : highest).toObject();
  }
}
