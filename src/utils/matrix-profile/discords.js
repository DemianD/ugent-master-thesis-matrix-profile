// @source: https://github.com/matrix-profile-foundation/matrixprofile/blob/master/matrixprofile/algorithms/top_k_discords.py

const calculateDiscords = (matrixProfile, exclusionZone, k = 3) => {
  const { windowSize, data, length } = matrixProfile;
  const discords = [];
  const n = length;

  const temp = data.map((row, i) => [...row, i]);

  const indices = temp
    .slice() // Making a copy because sort sorts in place
    .sort((a, b) => b[1] - a[1])
    .map((x) => [x[0], x[3]]);

  if (!exclusionZone) {
    exclusionZone = Math.floor(windowSize / 2);
  }

  for (let [date, idx] of indices) {
    if (temp[idx] !== Infinity) {
      discords.push(date);

      // apply exclusion zone
      if (exclusionZone > 0) {
        const exclusionZoneStart = Math.max(0, idx - exclusionZone);
        const exclusionZoneEnd = Math.min(n, idx + exclusionZone);

        for (let i = exclusionZoneStart; i < exclusionZoneEnd; i++) {
          temp[i] = Infinity;
        }
      }
    }

    if (discords.length === k) {
      break;
    }
  }

  return discords;
};

export default calculateDiscords;
