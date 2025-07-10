import prisma from '@/config/database';
import { Cryptocurrency } from '@/types';

export class CryptocurrencyService {
  static async getAllCryptocurrencies(): Promise<Cryptocurrency[]> {
    return await prisma.cryptocurrency.findMany({
      orderBy: { name: 'asc' },
    });
  }

  static async getCryptocurrencyById(id: string): Promise<Cryptocurrency | null> {
    return await prisma.cryptocurrency.findUnique({
      where: { id },
    });
  }
}
