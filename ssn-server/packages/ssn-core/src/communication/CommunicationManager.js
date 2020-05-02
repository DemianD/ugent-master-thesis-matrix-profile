import restify from 'restify';

import cors from './cors.js';
import { IMMMUTABLE_CACHE, NO_CACHE } from './constants.js';
import isReadableStream from './utils/isReadableStream.js';
import streamQuads from './utils/streamQuads.js';
import { NotFoundException, InvalidDateException } from '../exceptions/index.js';

class CommunicationManager {
  constructor() {
    this.server = restify.createServer();
    this.server.use(cors);
  }

  handleResponse(req, res, next) {
    return async handler => {
      try {
        let promiseOrObject = handler(req.params);

        if (promiseOrObject instanceof Promise) {
          promiseOrObject = await promiseOrObject;
        }

        const { immutable, body, headers } = promiseOrObject;

        res.setHeader('Cache-Control', immutable ? IMMMUTABLE_CACHE : NO_CACHE);

        // Currently, only trig is supported
        res.setHeader('Content-Type', 'application/trig');

        if (headers) {
          Object.entries(headers).forEach(([name, value]) => {
            res.setHeader(name, value);
          });
        }

        if (isReadableStream(body)) {
          body.pipe(res);

          body.once('close', () => next(false));
          res.once('close', () => body.close());
        } else {
          streamQuads(body || [], res);
        }
      } catch (exception) {
        res.send(this.getStatusCode(exception));
      }
    };
  }

  addEndpoints(endpoints) {
    Object.entries(endpoints).forEach(([endpoint, handler]) => {
      this.server.get(endpoint, (req, res, next) => this.handleResponse(req, res, next)(handler));
    });
  }

  getStatusCode(exception) {
    if (exception instanceof NotFoundException) {
      return 404;
    }
    if (exception instanceof InvalidDateException) {
      return 400;
    }

    console.error(exception);

    return 500;
  }

  listen(port, hostname) {
    this.server.listen(port, hostname);
  }
}

export default CommunicationManager;
