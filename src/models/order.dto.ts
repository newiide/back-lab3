import { IsString, IsNotEmpty, IsNumber, IsOptional } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OrderDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  from: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  to: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  @IsOptional()
  price: number;

  @ApiProperty({ type: Number })
  @IsNumber()
  @IsOptional()
  distance: number;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  status: string;
}
