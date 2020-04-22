import sys
import ntpath
import numpy as np
import pandas as pd

def readParkingDataToDateFrame(file):
    df = pd.read_csv(file, sep=";", dtype={'value': np.int16})

    df = df.set_index('date')
    df.index = pd.to_datetime(df.index, utc=True)
    
    return df


path = sys.argv[1]
name = ntpath.basename(sys.argv[1]).replace(".csv", "")

savePath = path.replace(name, name + "-grouped")

df = readParkingDataToDateFrame(sys.argv[1])
df = df.resample('60S').mean()

print("Empty values:", df['value'].isnull().sum())
df = df.dropna(subset=['value'])

df['value'] = df['value'].apply(np.floor).apply(np.int)
df.to_csv(savePath, sep = ";", date_format = "%Y-%m-%dT%H:%M:%S")
