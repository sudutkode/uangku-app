import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class SyncNotificationDto {
  @IsString()
  @IsNotEmpty()
  appName: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  text?: string;

  @IsString()
  @IsNotEmpty()
  date: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsNumber()
  @IsNotEmpty()
  transactionTypeId: number;
}
