const restoreIndividual = (string, TypedArray) => {
  return new Promise((resolve) => {
    const buf = new ArrayBuffer(string.length * 2); // 2 bytes for each char
    const uint16Array = new Uint16Array(buf);

    const stringLength = string.length;

    for (let i = 0; i < stringLength; i++) {
      uint16Array[i] = string.charCodeAt(i);
    }

    const worker = new Worker('restoreMatrixProfile.js');
    worker.postMessage(uint16Array.buffer, [uint16Array.buffer]);

    worker.onmessage = (e) => {
      resolve(new TypedArray(e.data));
    };
  });
};

const restore = (windowSize, dates, distances, indexes) => {
  return Promise.all([
    restoreIndividual(dates, Uint32Array),
    restoreIndividual(distances, Float32Array),
    restoreIndividual(indexes, Uint32Array),
  ]).then(([dates, distances, indexes]) => {
    const datesMap = new Map();
    const data = [];
    const length = dates.length;

    for (let i = 0; i < length; i++) {
      datesMap.set(dates[i] * 1000, i);
      data.push([dates[i] * 1000, distances[i], indexes[i] * 1000]);
    }

    return { windowSize, length, data: data, dates: datesMap };
  });
};

export default restore;
