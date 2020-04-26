import fs from 'fs';
import csvParse from 'csv-parse';

import CreateTransactionService from './CreateTransactionService';
import Transaction from '../models/Transaction';

interface Request {
  transactionsFilePath: string;
}

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  caterogy: string;
}

class ImportTransactionsService {
  public async execute({
    transactionsFilePath,
  }: Request): Promise<Transaction[]> {
    const readCSVStream = fs.createReadStream(transactionsFilePath);

    const parseStream = csvParse({
      from_line: 2,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const createTransactionService = new CreateTransactionService();

    const transactions: CSVTransaction[] = [];
    // const categories: string[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) return;
      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    // console.log(transactions);

    // transactions.map()
    transactions.map(async function (transaction) {
      // console.log(transaction);
      if (transaction.title && transaction.type && transaction.value) {
        console.log(transaction.title);
        const transactionAdded = await createTransactionService.execute({
          title: transaction.title,
          value: transaction.value,
          type: transaction.type,
          category: transaction.caterogy,
        });
      }
    });

    // return { transactions };
  }
}
export default ImportTransactionsService;
