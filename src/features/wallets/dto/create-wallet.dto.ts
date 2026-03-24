import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateWalletDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  balance: number;

  @IsString()
  @IsOptional() // 👈 Tambahkan ini
  appName?: string | null;
}
