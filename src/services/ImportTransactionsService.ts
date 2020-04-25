import { getRepository } from 'typeorm';
import path from 'path';
import fs from 'fs';

import uploadConfig from '../config/upload';

import Transaction from '../models/Transaction';

interface Request {
  transactionsFileName: string;
}

class ImportTransactionsService {
  async execute({ transactionsFileName }: Request): Promise<Transaction[]> {
    const importFilePath = path.join(
      uploadConfig.directory,
      transactionsFileName,
    );

    const importFileExists = await fs.promises.stat(importFilePath);

    if (importFileExists) {
      await fs.promises.unlink(userAvatarFilePath);
    }
  }
}

export default ImportTransactionsService;
