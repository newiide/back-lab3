import { Injectable } from '@nestjs/common';
import { LoginDto, UserDto, DriverDto, AdminDto } from '../models';
import { UserDoc, Users } from '../schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserAlreadyExists, UserNotFound } from '../shared';
import { randomUUID } from 'crypto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(Users.name)
    private readonly userModel: Model<UserDoc>,
  ) {}

  async createUser(body: UserDto) {
    const isExists = await this.userModel.findOne({
      login: body.login,
    });

    if (isExists) {
      throw new UserAlreadyExists(
        `User with login ${body.login} already exists`,
      );
    }
    const doc = new this.userModel(body);
    const user = await doc.save();
    return user.toObject();
  }

  async login(body: LoginDto) {
    const user = await this.userModel.findOne({
      login: body.login,
      password: body.password,
    });

    if (!user) {
      throw new UserNotFound(`User with login ${body.login} was not found`);
    }
    user.token = randomUUID();
    await user.save();
    return user.token;
  }

  async getAllUsers() {
    const users = await this.userModel.find(
      {},
      { token: false, password: false, login: false },
    );
    return users.map((user) => user.toObject());
  }

  async CreateAdmin(body: AdminDto) {
    const isExists = await this.userModel.findOne({
      login: body.login,
    });
    if (isExists) {
      throw new UserAlreadyExists(
        `User with login ${body.login} already exists`,
      );
    }
    body.role = 'Admin';
    const doc = new this.userModel(body);
    const admin = await doc.save();
    return admin.toObject();}

  async CreateDriver(body: DriverDto) {
    const isExists = await this.userModel.findOne({
      login: body.login,
    }); 
    if (isExists) {
      throw new UserAlreadyExists(
        `User with login ${body.login} already exists`,
      );}
    body.role = 'Driver';
    const doc = new this.userModel(body);
    const driver = await doc.save();
    return driver.toObject();
  }
}
