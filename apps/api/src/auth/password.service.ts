import { BadRequestException, Injectable } from '@nestjs/common';
import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core';
import { adjacencyGraphs, dictionary } from '@zxcvbn-ts/language-common';
import { translations } from '@zxcvbn-ts/language-en';
import * as argon2 from 'argon2';

@Injectable()
export class PasswordService {
  constructor() {
    zxcvbnOptions.setOptions({
      translations,
      graphs: adjacencyGraphs,
      dictionary: {
        ...dictionary,
      },
    });
  }

  async hash(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      timeCost: parseInt(process.env.ARGON2_TIME_COST || '3'),
      memoryCost: parseInt(process.env.ARGON2_MEMORY_COST || '65536'),
      parallelism: parseInt(process.env.ARGON2_PARALLELISM || '4'),
    });
  }

  async verify(hash: string, password: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch {
      return false;
    }
  }

  validateStrength(password: string, userInputs: string[] = []) {
    if (password.length < 12) {
      throw new BadRequestException('PASSWORD_TOO_SHORT');
    }

    const result = zxcvbn(password, userInputs);
    const minScore = parseInt(process.env.ZXCVBN_MIN_SCORE || '3');

    if (result.score < minScore) {
      throw new BadRequestException({
        message: 'PASSWORD_TOO_WEAK',
        score: result.score,
        suggestions: result.feedback.suggestions,
      });
    }

    return true;
  }
}
