import glob
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matrixprofile as mp

files = sorted(glob.glob('./data/data-*.csv'))

print(files)
dfs = []

for file in files:
    df = pd.read_csv(file, sep=",", header=None, names=['siteID', 'richting', 'type', 'van', 'tot', 'aantal'])
    dfs.append(df)

df = pd.concat(dfs)
df = df.groupby(df.van)['aantal'].sum().apply(np.int)
df = pd.DataFrame(df)

df.index = pd.to_datetime(df.index, utc=True)

df.to_csv('./data/combined.csv', sep = ";", date_format = "%Y-%m-%dT%H:%M:%S")

