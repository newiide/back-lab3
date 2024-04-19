import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  
  UnauthorizedException,
  UseGuards,
  
  Req
} from '@nestjs/common';
import { UserService } from '../service';
import { LoginDto, UserDto, AdminDto, DriverDto } from '../models';
import { UserAlreadyExists, UserNotFound } from '../shared'; 
import { UserAuthorizationMiddleware } from 'src/midellware/userAuthorization.middleware';

@Controller({ path: '/users' })
export class UsersController {
  constructor(private readonly userService: UserService) { }

  @Post('/')
  async createUser(@Body() body: UserDto) {
    try {
      const result = await this.userService.createUser(body);
      return result;
    } catch (err) {
      if (err instanceof UserAlreadyExists) {
        throw new BadRequestException(err.message);
      }
      throw err;
    }
  }

  @Post('/login')
  async login(@Body() body: LoginDto) {
    try {
      const result = await this.userService.login(body);
      return { token: result };
    } catch (err) {
      if (err instanceof UserNotFound) {
        throw new BadRequestException(err.message);
      }
      throw err;
    }
  }

  @Get('/')
  async getAllUsers() {
    return this.userService.getAllUsers();
  }
}

@Controller({ path: '/admin' })
  @UseGuards(UserAuthorizationMiddleware) 
  export class AdminController {
    constructor(private readonly userService: UserService) {}

  @Post('/')
  async createAdmin(@Body() body: AdminDto, 
  @Req() req: Request) {
    const { authorization } = req.headers as any; 

    if (authorization !== 'Password') {
      throw new UnauthorizedException('Unauthorized access');
    }

    try {
      body.role = 'Admin'; 
      const result = await this.userService.CreateAdmin(body);
      return result;
    } catch (err) {
      if (err instanceof UserAlreadyExists) {
        throw new BadRequestException(err.message);
      }
      throw err;
    }
  }
}

@Controller({ path: '/drivers' })
export class DriverController {
  constructor(private readonly userService: UserService) {}

  @Post('/')
  async createDriver(@Body() body: DriverDto) {
    try {
      body.role = 'Driver'; 
      const result = await this.userService.CreateDriver(body);
      return result;
    } catch (err) {
      if (err instanceof UserAlreadyExists) {
        throw new BadRequestException(err.message);
      }
      throw err;
    }
  }
}