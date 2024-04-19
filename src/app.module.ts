import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersController, AdminController, DriverController  } from './controllers/users.controller';
import { UserService } from './service/user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AddressesSchema, Addresses, Orders, OrdersSchema, UserSchema, Users } from './schema';
import { UserAuthorizationMiddleware } from './midellware/userAuthorization.middleware';
import { OrdersController } from './controllers/orders.controller';
import { OrderService } from './service';
import { AddressesService} from './service/addresses.service';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://newide:4errty09nmcfg@ihatemylife.jrambdc.mongodb.net/?retryWrites=true&w=majority&appName=Ihatemylife',
      { dbName: 'ihatemylife' },
    ),
    MongooseModule.forFeature([
      {
        name: Users.name,
        schema: UserSchema,
      },
      {
        name: Orders.name,
        schema: OrdersSchema,
      },
      {
        name: Addresses.name,
        schema: AddressesSchema
      }
    ]),
  ],
  controllers: [UsersController, OrdersController, AdminController, DriverController],
  providers: [UserService, OrderService, AddressesService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserAuthorizationMiddleware).forRoutes('/orders');
  }
}
