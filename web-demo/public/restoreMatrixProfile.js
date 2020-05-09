// https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
// https://stackoverflow.com/questions/3195865/converting-byte-array-to-string-in-javascript
const ab2str = (buffer) => {
  const uint16Array = new Uint16Array(buffer);

  const strings = [];
  const chunksize = 55535;

  for (let i = 0; i * chunksize < uint16Array.length; i++) {
    strings.push(
      String.fromCharCode.apply(null, uint16Array.subarray(i * chunksize, (i + 1) * chunksize))
    );
  }

  return strings.join('');
};

onmessage = async function (e) {
  const string = ab2str(e.data);
  const parts = string.split(',');

  let previous = 0;
  const times = [];

  parts.forEach((part) => {
    previous = previous + Number(part);
    times.push(previous);
  });

  const typedArray = Number.isInteger(previous) ? Uint32Array : Float32Array;

  const instance = typedArray.from(times);
  postMessage(instance.buffer, [instance.buffer]);
};
