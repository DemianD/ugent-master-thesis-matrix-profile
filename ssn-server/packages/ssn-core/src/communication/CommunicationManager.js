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

  handleResponse(req, res) {
    return handler => {
      try {
        const { immutable, body } = handler(req.params);

        res.setHeader('Cache-Control', immutable ? IMMMUTABLE_CACHE : NO_CACHE);

        // Currently, only trig is supported
        // res.setHeader('Content-Type', 'application/trig');
        res.setHeader('Content-Type', 'application/trig');

        if (isReadableStream(body)) {
          body.pipe(res);
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
