import fs from 'fs';
import csvParse from 'csv-parse';
import { getRepository, In } from 'typeorm';

// import Category from '../models/Category';
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

    for await (const transaction_csv of transactions_csv) {
      const transaction = await createTransactionService.execute({
        title: transaction_csv.title,
        value: transaction_csv.value,
        type: transaction_csv.type,
        category: transaction_csv.category,
      });
      transactions.push(transaction);
    }

    return transactions;
  }
}
export default ImportTransactionsService;
