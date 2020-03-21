import sys
sys.path.append("..")

import stumpy
from utils import readParkingDataToDateFrame, plot, calculateMatrixProfile, checkNaNs, plotFluss

title = "Parking P-Houtmarkt"
df = readParkingDataToDateFrame('./data/kortrijk/P-K-in-Kortrijk.csv')

# Taking last X days, and hourly mean
df = df.last('60D')
df = df.resample('H').mean()
df = checkNaNs(df)

m = 24
matrix_profile, matrix_profile_index = calculateMatrixProfile(m, df, "value")

L = 24
n_regimes = 2
excl_factor = 2
cac, regime_locations = stumpy.fluss(matrix_profile_index, L=L, n_regimes=n_regimes, excl_factor=excl_factor)

values = df.values[: -m+1]
index = df.index[: -m+1]

plotFluss(title, index, values, matrix_profile, cac, regime_locations)
