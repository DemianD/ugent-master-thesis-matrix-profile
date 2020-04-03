import { NotFoundException, InvalidDateException } from '../exceptions/index.js';

import {
  catalogHandler,
  featureOfInterestHandler,
  observablePropertyHandler
} from './routes/index.js';

import streamQuads from './utils/streamQuads.js';
import isReadableStream from '../utils/isReadableStream.js';

class WebServer {
  constructor(domain, server) {
    this.domain = domain;
    this.server = server;

    this.registerRoutes();
  }

  registerRoutes() {
    const handleQuads = route => (req, res) => {
      try {
        const data = route(this.domain, req.params);

        res.setHeader('Cache-Control', data.cache);
        res.setHeader('Content-Type', 'text');

        if (isReadableStream(data.body)) {
          data.body.pipe(res);
        } else {
          streamQuads(data.body || [], res, 'application/trig');
        }
      } catch (exception) {
        res.send(this.getStatusCode(exception));
      }
    };

    this.server.get('/catalog', handleQuads(catalogHandler));
    this.server.get('/:featureOfInterest', handleQuads(featureOfInterestHandler));

    this.server.get(
      '/:featureOfInterest/:observableProperty/collection/:pageName',
      handleQuads(observablePropertyHandler)
    );
  }

  getStatusCode(exception) {
    if (exception instanceof NotFoundException) {
      return 404;
    }
    if (exception instanceof InvalidDateException) {
      return 400;
    }

    return 500;
  }
}

export default WebServer;
