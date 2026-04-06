import {
  IsNumber,
  IsEnum,
  IsString,
  IsEmail,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

/**
 * DTO for mobile app to create a donation
 *
 * This is the EXACT structure your mobile app should send
 * to create a payment intent and record the donation.
 *
 * @example
 * POST /api/mosques/:mosque_slug/donations/create-intent
 * {
 *   "amount": 1000,
 *   "donation_type": "one_time",
 *   "purpose": "general",
 *   "donor_name": "John Doe",
 *   "donor_email": "john@example.com",
 *   "donor_phone": "+16175551234"
 * }
 */
export class CreateDonationIntentDto {
  /**
   * Donation amount in CENTS
   * @example 1000 → $10.00
   * @example 5000 → $50.00
   * @example 100 → $1.00
   *
   * @validation Min: 100 cents ($1.00), Max: 1000000 cents ($10,000.00)
   */
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(100, { message: 'Minimum donation is $1.00 (100 cents)' })
  @Max(1000000, { message: 'Maximum donation is $10,000.00 (1000000 cents)' })
  amount: number;

  /**
   * Type of donation
   * - "one_time": Single donation (creates PaymentIntent)
   * - "monthly": Recurring monthly (creates Subscription)
   *
   * @example "one_time"
   * @example "monthly"
   */
  @IsEnum(['one_time', 'monthly'], {
    message: 'donation_type must be either "one_time" or "monthly"',
  })
  donation_type: 'one_time' | 'monthly';

  /**
   * Purpose of donation (categorization)
   * REQUIRED - must be one of the allowed values
   *
   * @example "general"
   * @example "zakat"
   * @example "sadaqah"
   * @example "ramadan"
   * @example "building_fund"
   *
   * Accepted values:
   * - general: General mosque operations
   * - zakat: Zakat (obligatory charity)
   * - sadaqah: Voluntary charity
   * - ramadan: Ramadan relief/iftars
   * - building_fund: Building/expansion project
   */
  @IsEnum(['general', 'zakat', 'sadaqah', 'ramadan', 'building_fund'], {
    message: 'purpose must be one of: general, zakat, sadaqah, ramadan, building_fund',
  })
  purpose: 'general' | 'zakat' | 'sadaqah' | 'ramadan' | 'building_fund';

  /**
   * Donor's full name (for receipts)
   * Required for guest/anonymous donations
   * Optional if authenticated user
   *
   * @example "John Doe"
   * @example "Fatima Al-Rashidah"
   */
  @IsString({ message: 'donor_name must be a string' })
  donor_name: string;

  /**
   * Donor's email address (for receipt delivery)
   * This email will receive the donation receipt
   *
   * @example "john@example.com"
   * @example "donor@mymail.com"
   */
  @IsEmail({}, { message: 'donor_email must be a valid email address' })
  donor_email: string;

  /**
   * Donor's phone number (optional, for contact)
   *
   * @example "+16175551234"
   * @example "(617) 555-1234"
   * @example "6175551234"
   */
  @IsOptional()
  @IsString()
  donor_phone?: string;

  /**
   * Donor's message/note (optional)
   * Will be saved with the donation record
   *
   * @example "May Allah bless this mosque"
   */
  @IsOptional()
  @IsString()
  donor_message?: string;

  /**
   * Whether donor wants to be anonymous
   * If true, name won't be published in lists
   *
   * @example true
   * @example false
   */
  @IsOptional()
  is_anonymous?: boolean = false;
}

/**
 * DTO Response from CreateDonationIntent endpoint
 * Mobile app receives this after creating an intent
 */
export class DonationIntentResponseDto {
  /**
   * Success indicator
   */
  success: boolean;

  /**
   * Response data
   */
  data: {
    /**
     * Donation ID in database
     */
    donation_id: string;

    /**
     * Client secret for Stripe payment
     * Pass this to Stripe client on mobile
     */
    client_secret: string;

    /**
     * Type of payment flow
     */
    type: 'payment_intent' | 'subscription';

    /**
     * Amount in cents
     */
    amount: number;

    /**
     * Amount in formatted USD string
     */
    amount_display: string;

    /**
     * Payment Intent ID (for one-time)
     */
    payment_intent_id?: string;

    /**
     * Subscription ID (for monthly)
     */
    subscription_id?: string;

    /**
     * Stripe account for this mosque
     */
    stripe_account: string;

    /**
     * Timestamp when created
     */
    created_at: string;
  };

  /**
   * Error message if something failed
   */
  error?: {
    code: string;
    message: string;
  };
}

/**
 * DTO for confirming a donation payment
 * Mobile app sends this after payment is complete on Stripe
 */
export class ConfirmDonationDto {
  /**
   * Payment Intent ID or Subscription ID
   */
  payment_id: string;

  /**
   * Type of payment
   */
  type: 'payment_intent' | 'subscription';

  /**
   * Invoice ID (from Stripe, for receipts)
   */
  invoice_id?: string;
}

/**
 * DTO for donation history/details
 * Returned when user asks for their donations
 */
export class DonationHistoryDto {
  id: string;
  amount: number;
  amount_display: string;
  donation_type: 'one_time' | 'monthly';
  purpose: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  donor_name: string;
  created_at: string;
  receipt_url?: string;
}
