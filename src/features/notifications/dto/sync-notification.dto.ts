import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class SyncNotificationDto {
  @IsString()
  @IsNotEmpty()
  app: string; // contoh: 'com.gojek.app'

  @IsString()
  @IsNotEmpty()
  title: string; // contoh: 'Pembayaran Berhasil'

  @IsString()
  @IsNotEmpty()
  text: string; // contoh: 'Kamu telah membayar Rp50.000 ke Tokopedia'

  @IsDateString()
  date: string; // ISO string dari HP saat notifikasi muncul
}
