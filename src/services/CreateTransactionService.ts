import { getCustomRepository, getRepository } from 'typeorm';

// import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);

    const categoryRepository = getRepository(Category);

    let categoryObject = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!categoryObject) {
      categoryObject = categoryRepository.create({
        title: category,
      });
      categoryRepository.save(categoryObject);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: categoryObject?.id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
