import { throwIfMissing } from './utils';

class TokenService {
  constructor(createTokenFn = throwIfMissing('Create token function')) {
    this.createToken = createTokenFn;
  }
  createAndStoreEmailToken(emailAdress) {
    return this.createTokenFn({
      email: emailAdress,
      table: 'verify_tokens',
      hoursValid: 48,
      withEmail: true,
    });
  }
  createAndStoreResetToken(emailAdress) {
    return this.createTokenFn({
      email: emailAdress,
      table: 'reset_tokens',
      hoursValid: 2,
      withEmail: true,
    });
  }
}

export default TokenService;
