import Query from './Query';
import { HYDRA } from '../utils/vocs';

class HydraQuery extends Query {
  constructor(filters, withMetadata, onData, limit) {
    super(filters, withMetadata, onData);

    this.limit = limit || Infinity;
  }

  handleRelations(types, subjects) {
    const hydraView = this.getHydraView(types, subjects);

    const next = hydraView[HYDRA('next').value];

    if (next) {
      this.execute(next.value);
    }
  }
}

export default HydraQuery;
