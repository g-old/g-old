import { throwIfMissing } from './utils';

class TokenService {
  constructor(
    cryptoService = throwIfMissing('Crypto service'),
    dbConnector = throwIfMissing('Database connector'),
  ) {
    this.crypto = cryptoService;
    this.db = dbConnector;
  }
  /* genToken() {}

  checkToken() {}
  */
}

export default TokenService;
