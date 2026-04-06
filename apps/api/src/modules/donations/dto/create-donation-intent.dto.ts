import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class CreateDonationIntentDto {
  @IsNumber()
  amount: number; // in cents

  @IsEnum(['one_time', 'monthly'])
  donation_type: 'one_time' | 'monthly';

  @IsEnum(['general', 'zakat', 'sadaqah', 'ramadan', 'building_fund'])
  purpose: 'general' | 'zakat' | 'sadaqah' | 'ramadan' | 'building_fund';

  @IsOptional()
  @IsString()
  donor_name?: string;

  @IsOptional()
  @IsString()
  donor_email?: string;
}
