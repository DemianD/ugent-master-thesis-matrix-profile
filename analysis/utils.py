import matplotlib.pyplot as plt
import pandas as pd
import os

def readFilesToDataFrame(folder):
    times = []
    values = []

    fileNames = sorted(os.listdir(folder))
    
    for fileName in fileNames:
        path = folder + fileName
        file = open(path, "r").read().split('\n')

        for line in file:
            # New line
            if line != "":
                parts = line.split('\t')
                
                times.append(parts[0])
                values.append(parts[1])

    df = pd.DataFrame(data=values, index=times, columns=['values'])
    df.index = pd.to_datetime(df.index)

    return df

def plot(df):
    plt.figure(figsize=(15,5))
    plt.subplot(1, 1, 1)
    plt.plot(df.index, df.values)
    plt.show()
