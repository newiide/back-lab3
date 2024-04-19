import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, IsOptional } from '@nestjs/class-validator';

export class UserDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  login: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  role: string;
}

export class DriverDto {
  @IsString()
  @IsNotEmpty()
  login: string;

  @IsString()
  @IsNotEmpty()
  password: string;
  
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  role: string;
}

export class AdminDto {
  @IsString()
  @IsNotEmpty()
  login: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  role: string;
}