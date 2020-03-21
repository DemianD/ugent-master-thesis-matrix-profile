import sys
sys.path.append("..")

import stumpy
from utils import readTelraamDataToDateFrame, plot, calculateMatrixProfile, checkNaNs, plotFluss

segmentId = "338695"
title = "Telraam segment " + segmentId
column = "total"

df = readTelraamDataToDateFrame("./data/" + segmentId + ".txt")
df = df[[column]]

df = df.last('35D')
df = checkNaNs(df)

m = 24
matrix_profile, matrix_profile_index = calculateMatrixProfile(m, df, column)

L = 24
n_regimes = 3
excl_factor = 2
cac, regime_locations = stumpy.fluss(matrix_profile_index, L=L, n_regimes=n_regimes, excl_factor=excl_factor)

values = df.values[: -m+1]
index = df.index[: -m+1]

plotFluss(title, index, values, matrix_profile, cac, regime_locations)
