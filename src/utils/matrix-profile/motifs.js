// @source: https://github.com/matrix-profile-foundation/matrixprofile/blob/master/matrixprofile/algorithms/top_k_motifs.py

const applyExclusionZone = (exclusionZone, index, distanceProfile) => {
  if (exclusionZone > 0) {
    const ez_start = Math.max(0, index - exclusionZone);
    const ez_end = Math.min(distanceProfile.length, index + exclusionZone);

    for (let i = ez_start; i < ez_end; i++) {
      distanceProfile[i] = Infinity;
    }
  }

  return distanceProfile;
};

const calculateMotifs = (matrixProfile, exclusionZone, k = 3, maxNeighbors = 10, radius = 3) => {
  const motifs = [];
  const { windowSize, data, dates } = matrixProfile;

  if (!exclusionZone) {
    exclusionZone = Math.floor(windowSize / 2);
  }

  let mp = data.map((row, i) => [...row, i]);

  for (let i = 0; i < k; i++) {
    const minimum = mp
      .slice()
      .sort((a, b) => a[1] - b[1])
      .find((x) => x !== Infinity);

    if (!minimum) {
      break;
    }

    const min_idx = minimum[3];
    const min_index = dates.get(minimum[2]) || -1;

    mp = applyExclusionZone(exclusionZone, min_idx, mp);
    mp = applyExclusionZone(exclusionZone, min_index, mp);

    motifs.push([minimum[0], minimum[2]]);
  }

  return motifs;
};

export default calculateMotifs;
