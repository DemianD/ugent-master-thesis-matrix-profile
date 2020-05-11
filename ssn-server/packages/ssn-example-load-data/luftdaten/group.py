import sys
import ntpath
import numpy as np
import pandas as pd

path = sys.argv[1]
name = ntpath.basename(sys.argv[1]).replace(".csv", "")

savePath = path.replace(name, name + "-grouped")

df = pd.read_csv(path, sep=";")

df = df.set_index('date')
df.index = pd.to_datetime(df.index, utc=True)

df = df.resample('300S').mean()

print("Empty P1 values:", df['P1'].isnull().sum())
df = df.dropna(subset=['P1'])

print("Empty P2 values:", df['P2'].isnull().sum())
df = df.dropna(subset=['P2'])

df = df.round({'P1': 2, 'P2': 2})

df.to_csv(savePath, sep = ";", date_format = "%Y-%m-%dT%H:%M:%S")
