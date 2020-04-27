import fs from 'fs';
import csvParse from 'csv-parse';
import { getRepository, In } from 'typeorm';

import Category from '../models/Category';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  transactionsFilePath: string;
}

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  public async execute({
    transactionsFilePath,
  }: Request): Promise<Transaction[]> {
    const createTransactionService = new CreateTransactionService();

    const readCSVStream = fs.createReadStream(transactionsFilePath);

    const parseStream = csvParse({
      from_line: 2,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const transactions_csv: CSVTransaction[] = [];
    const transactions: Transaction[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) return;

      transactions_csv.push({ title, type, value, category });
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    for await (const transaction of transactions_csv) {
      await createTransactionService.execute({
        title: transaction.title,
        value: transaction.value,
        type: transaction.type,
        category: transaction.category,
      });
      await transactions.push(transaction);
    }

    return { transactions };
  }
}
export default ImportTransactionsService;
