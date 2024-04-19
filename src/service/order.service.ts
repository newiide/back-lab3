import { Injectable, BadRequestException } from '@nestjs/common';
import { OrderDto } from '../models';
import { Orders, OrdersDoc } from '../schema';
import { AddressesService } from './addresses.service';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Orders.name)
    private readonly orderModel: Model<OrdersDoc>,
    private readonly addressesService: AddressesService,
  ) { }

  async createOrder(body: OrderDto & { login: string }) {
    try {
      const fromAddress = await this.addressesService.findAddresses(body.from);
      const toAddress = await this.addressesService.findAddresses(body.to);

      if (!fromAddress || !toAddress) {
        throw new BadRequestException('User is not found');
      }

      const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const deltaLat = Math.abs(lat2 - lat1);
        const deltaLon = Math.abs(lon2 - lon1);
        return Math.sqrt(deltaLat * deltaLat + deltaLon * deltaLon);
      };


      const distance = calculateDistance(fromAddress.location.latitude, 
        fromAddress.location.longitude, toAddress.location.latitude, toAddress.location.longitude);

      if (isNaN(distance)) {
        throw new BadRequestException('Invalid coordinates or distance calculation');
      }

      let price: number;
      switch (body.type) {
        case 'standard':
          price = distance * 2.5;
          break;
        case 'lite':
          price = distance * 1.5;
          break;
        case 'universal':
          price = distance * 3;
          break;
        default:
          throw new BadRequestException('Order type is wrong');
      }

      if (isNaN(price)) {
        throw new BadRequestException('Invalid price calculation');
      }

      const orderData = {
        ...body,
        login: body.login,
        status: 'Active',
        distance: distance,
        price: parseFloat(price.toFixed(2)),
      };

      const doc = new this.orderModel(orderData);
      const order = await doc.save();

      return order;
    } catch (error) {
      throw error;
    }
  }

  async getOrders(login: string, role: string): Promise<OrdersDoc[]> {
    try {
      let ordersQuery = this.orderModel.find();
      if (role === 'Driver') {
        ordersQuery = ordersQuery.where('status').equals('Active');
      } else if (role !== 'Admin') {
        ordersQuery = ordersQuery.where('login').equals(login);
      }
      const orders = await ordersQuery.exec();
      return orders;
    } catch (error) {
      throw new BadRequestException('Failed');
    }
  }


  async updateOrderStatus(orderId: string, status: string, role: string) {
    try {
      const order = await this.orderModel.findById(orderId);
      if (!order) {
        throw new BadRequestException(`Order with id ${orderId} was not found`);
      }
      if (order.status === 'Done') {
        throw new BadRequestException(`Order status can't be changed from Done`);
      }
      if (
        (role === 'Customer' && order.status === 'Active' && status === 'Rejected') ||
        (role === 'Driver' && (
          (order.status === 'Active' && status === 'In progress') ||
          (order.status === 'In progress' && status === 'Done')
        )) ||
        (role === 'Admin' && (
          (order.status === 'Active' && ['Rejected', 'In progress'].includes(status)) ||
          (order.status === 'In progress' && status === 'Done')
        ))
      ) {
        await this.orderModel.findByIdAndUpdate(orderId, { status });
        return { message: `Order status changed` };
      } else {
        throw new BadRequestException(`Order status can't be changed`);
      }
    } catch (error) {
      throw error;
    }
  }

  async Last5From(login: string): Promise<string[]> {
    try {
      const orders = await this.orderModel.find({ login }, { from: 1, _id: 0 });
      const differentAddresses = [...new Set(orders.map(order => order.from))];
      const last5 = differentAddresses.slice(-5);
      return last5;
    } catch (error) {
      throw error;
    }
  }

  async Last3To(login: string): Promise<string[]> {
    try {
      const orders = await this.orderModel.find({ login }, { to: 1, _id: 0 });
      const differentAddresses = [...new Set(orders.map(order => order.to))];
      const last3 = differentAddresses.slice(-3);
      return last3;
    } catch (error) {
      throw error;
    }
  }

  async getLowestPrice(login: string): Promise<OrderDto> {
    try {
      const orders = await this.orderModel.find({ login });
      if (orders.length === 0) {
        return null;
      }
      const lowestPrice = orders.reduce((lowest, order) => {
        return order.price < lowest.price ? order : lowest;
      });
      return lowestPrice.toObject();
    } catch (error) {
      throw error;
    }
  }

  async getBiggestPrice(login: string): Promise<OrderDto> {
    try {
      const orders = await this.orderModel.find({ login });
      if (orders.length === 0) {
        return null;
      }
      const biggestPrice = orders.reduce((lowest, order) => {
        return order.price > lowest.price ? order : lowest;
      });
      return biggestPrice.toObject();
    } catch (error) {
      throw error;
    }
  }
}
