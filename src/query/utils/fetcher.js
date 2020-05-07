import ldfetch from 'ldfetch';

const fetcher = new ldfetch();

fetcher.on('cache-miss', () => {
  console.log('cache-miss');
});

fetcher.on('cache-hit', () => {
  console.log('cache-hit');
});

fetcher.on('downloaded', () => {
  console.log('cache-downloaded');
});

export default fetcher;
