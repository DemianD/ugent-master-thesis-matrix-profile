class AbstractDisk {
  constructor() {}

  async write() {
    return Promise.resolve();
  }

  read(name) {
    return undefined;
  }
}

export default AbstractDisk;
