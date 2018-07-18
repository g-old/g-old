import { throwIfMissing } from './utils';

class TokenService {
  constructor(createTokenFn = throwIfMissing('Create token function')) {
    this.createToken = createTokenFn;
  }

  createAndStoreEmailToken(
    emailAdress,
    newEmail = throwIfMissing('New email-address'),
  ) {
    return this.createToken({
      email: emailAdress,
      newEmail,
      table: 'verify_tokens',
      hoursValid: 48,
      withEmail: true,
    });
  }

  createAndStoreResetToken(emailAdress) {
    return this.createToken({
      email: emailAdress,
      table: 'reset_tokens',
      hoursValid: 2,
      withEmail: false,
    });
  }
}

export default TokenService;
