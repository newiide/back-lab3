import { Body, Controller, Post, Req, Get,Patch } from '@nestjs/common';
import { OrderService } from '../service';
import { OrderDto } from '../models';
import { UserLeanDoc } from '../schema';

@Controller({ path: '/orders' })
export class OrdersController {
  constructor(private readonly orderService: OrderService) {}

  @Post('/')
  async createOrder(
    @Body() body: OrderDto,
    @Req() req: Request & { user: UserLeanDoc },
  ) {
    try {
      const { user } = req;

      const order = await this.orderService.createOrder({
        ...body,
        login: user.login,
      });
      return order;
    } catch (err) {
      throw err;
    }
  }

  @Get('/')
  async getOrders(@Req() req: Request & { user: { login: string, role: string } }) {
    const { login, role } = req.user;
    return this.orderService.getOrders(login, role);
  }

  @Patch('/:orderId')
  async updateOrderStatus(
    @Body() body: { status: string },
    @Req() req: Request & { params: { orderId: string }, user: { role: string } },
  ) {
    try {
      const { params, user } = req;
      const result = await this.orderService.updateOrderStatus(params.orderId, body.status, user.role);
      
      return result;
    } catch (err) {
      throw err;
    }
  }

  
  @Get('/addresses/from/last-5')
  async getLast5Fromddresses(@Req() req: Request & { user: UserLeanDoc }) {
    try {
      const { user } = req;
      const last5Addresses = await this.orderService.getRecentFromAddresses(user.login);
      return last5Addresses;
    } catch (err) {
      throw err;
    }
  }

 

  @Get('/addresses/to/last-3')
  async getLast3ToAddresses(@Req() req: Request & { user: UserLeanDoc }) {
    try {
      const { user } = req;
      const last3Addresses = await this.orderService.getRecentToAddresses(user.login);
      return last3Addresses;
    } catch (err) {
      throw err;
    }
  }

  @Get('/lowest')
  async getLowestPriceOrder(@Req() req: Request & { user: UserLeanDoc }) {
    try {
      const { user } = req;
      const lowestPriceOrder = await this.orderService.getLowestPrice(user.login);
      return lowestPriceOrder;
    } catch (err) {
      throw err;
    }
  }


  @Get('/biggest')
  async getBiggestPriceOrder(@Req() req: Request & { user: UserLeanDoc }) {
    try {
      const { user } = req;
      const biggestPriceOrder = await this.orderService.getBiggestPrice(user.login);
      return biggestPriceOrder;
    } catch (err) {
      throw err;
    }
  }

  }


