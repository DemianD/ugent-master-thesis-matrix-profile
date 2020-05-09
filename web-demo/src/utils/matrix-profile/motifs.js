// @source: https://github.com/matrix-profile-foundation/matrixprofile/blob/master/matrixprofile/algorithms/top_k_motifs.py

const defaultFilter = (item) => {
  return true;
};

const applyExclusionZone = (exclusionZone, index, distanceProfile) => {
  if (exclusionZone > 0) {
    const ez_start = Math.max(0, index - exclusionZone);
    const ez_end = Math.min(distanceProfile.length, index + exclusionZone);

    for (let i = ez_start; i < ez_end; i++) {
      distanceProfile[i] = Infinity;
    }
  }
};

const calculateMotifs = (matrixProfile, exclusionZone, k = 3, filter = defaultFilter) => {
  const { windowSize, data, dates } = matrixProfile;
  const motifs = [];

  if (!exclusionZone) {
    exclusionZone = Math.floor(windowSize / 2);
  }

  // 0: date
  // 1: distance
  // 2: index
  // 3: date mapped to integer
  const temp = data.map((row, i) => [...row, i]);

  for (let i = 0; i < k; i++) {
    const minimum = temp
      .slice()
      .sort((a, b) => a[1] - b[1])
      .find((x) => x !== Infinity && filter(x));

    if (!minimum) {
      break;
    }

    const min_idx = minimum[3];
    const min_index = dates.get(minimum[2]) || -1;

    applyExclusionZone(exclusionZone, min_idx, temp);
    applyExclusionZone(exclusionZone, min_index, temp);

    motifs.push([minimum[0], minimum[2]]);
  }

  return motifs;
};

export default calculateMotifs;
