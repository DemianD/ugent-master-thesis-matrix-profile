// @source: https://github.com/matrix-profile-foundation/matrixprofile/blob/master/matrixprofile/algorithms/top_k_discords.py

const defaultFilter = () => {
  return true;
};

const calculateDiscords = (matrixProfile, exclusionZone, k = 3, filter = defaultFilter) => {
  const { windowSize, data, length } = matrixProfile;
  const discords = [];
  const n = length;

  // 0: date
  // 1: distance
  // 2: index (not used)
  // 3: date mapped to integer
  const temp = data.map((row, i) => [...row, i]);

  const mpSortedDistance = temp
    .slice() // Making a copy because sort sorts in place
    .sort((a, b) => b[1] - a[1]);

  if (!exclusionZone) {
    exclusionZone = Math.floor(windowSize / 2);
  }

  for (let item of mpSortedDistance) {
    const date = item[0];
    const idx = item[3];

    if (!filter(item)) {
      continue;
    }

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
