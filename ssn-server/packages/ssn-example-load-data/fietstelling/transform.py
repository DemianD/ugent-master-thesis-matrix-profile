import glob
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matrixprofile as mp

files = sorted(glob.glob('./data/data-*.csv'))

dfs = []

for file in files:
    df = pd.read_csv(file, sep=",", header=None, names=['siteID', 'richting', 'type', 'van', 'tot', 'aantal'])
    dfs.append(df)

df = pd.concat(dfs)
df = df.groupby([df.siteID, df.van])['aantal'].sum().apply(np.int)
df = pd.DataFrame(df)

for siteID in df.index.get_level_values(0).unique():
    dfIndividual = df.loc[siteID]
    dfIndividual.index = pd.to_datetime(dfIndividual.index, utc=True)
    dfIndividual.to_csv('./data/' + str(siteID) + '.csv', sep = ";", date_format = "%Y-%m-%dT%H:%M:%S")
    print(dfIndividual)

