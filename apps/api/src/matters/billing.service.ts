import { BadRequestException, Injectable } from '@nestjs/common';
import { TimeEntry } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const SUPPORTED_CURRENCIES = ['NGN', 'GBP', 'USD', 'GHS', 'KES', 'ZAR'];
const BASE_CURRENCY = 'USD';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  async getMatterWip(matterId: string) {
    const entries = await this.prisma.timeEntry.findMany({
      where: { matterId, billed: false },
    });

    const rates = await this.getFxRates();

    // Group by currency and calculate totals
    const wipByCurrency = entries.reduce(
      (acc: Record<string, number>, curr: TimeEntry) => {
        const currency = curr.currency;
        const amount = Number(curr.hours) * Number(curr.rate);

        if (!acc[currency]) acc[currency] = 0;
        acc[currency] += amount;

        return acc;
      },
      {} as Record<string, number>,
    );

    // Calculate total WIP in base currency (USD)
    let totalWipBase = 0;
    for (const [currency, amount] of Object.entries(wipByCurrency)) {
      const rate = rates[currency] || 1;
      totalWipBase += amount / rate;
    }

    return {
      matterId,
      wipByCurrency,
      totalWipBase: Number(totalWipBase.toFixed(2)),
      baseCurrency: BASE_CURRENCY,
      entryCount: entries.length,
      ratesUsed: rates,
    };
  }

  async logTime(data: {
    matterId: string;
    userId: string;
    description: string;
    hours: number;
    rate: number;
    currency: string;
  }) {
    if (!SUPPORTED_CURRENCIES.includes(data.currency)) {
      throw new BadRequestException(
        `Unsupported currency. Must be one of: ${SUPPORTED_CURRENCIES.join(', ')}`,
      );
    }

    return this.prisma.timeEntry.create({
      data: {
        ...data,
        date: new Date(),
      },
    });
  }

  async setFxRates(rates: Record<string, number>) {
    return this.prisma.globalSetting.upsert({
      where: { key: 'fx_rates' },
      update: { value: rates },
      create: { key: 'fx_rates', value: rates },
    });
  }

  private async getFxRates(): Promise<Record<string, number>> {
    const setting = await this.prisma.globalSetting.findUnique({
      where: { key: 'fx_rates' },
    });

    if (!setting) {
      // Default rates if not set (1 unit of currency = X USD)
      // Note: These should be updated via setFxRates
      return {
        USD: 1,
        GBP: 1.27,
        NGN: 0.00065,
        GHS: 0.066,
        KES: 0.0077,
        ZAR: 0.054,
      };
    }

    return setting.value as unknown as Record<string, number>;
  }
}
