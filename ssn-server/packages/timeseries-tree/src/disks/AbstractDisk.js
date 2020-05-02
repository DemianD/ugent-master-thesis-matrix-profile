class AbstractDisk {
  constructor() {}

  async write() {
    return Promise.resolve();
  }

  read(name) {
    throw new Error('AbstractDisk does not read files.');
  }
}

export default AbstractDisk;
