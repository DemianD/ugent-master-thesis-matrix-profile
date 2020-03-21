import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import os
import stumpy
import hashlib

from distancematrix.generator.znorm_euclidean import ZNormEuclidean
from distancematrix.consumer.matrix_profile_lr import MatrixProfileLR 
from distancematrix.calculator import AnytimeCalculator

from matrixprofile import matrixProfile

def readParkingDataToDateFrame(file):
    df = pd.read_csv(file, sep=";")

    df = df.set_index('date')
    df.index = pd.to_datetime(df.index)

    df = checkNaNs(df)
    
    return df

def readTelraamDataToDateFrame(file):
    df = pd.read_csv(file, sep=";")

    df = df.set_index('date')
    df.index = pd.to_datetime(df.index)
    df['total'] = df['pedestrian'] + df['bike'] + df['car'] + df['lorry']
    df['total'] = df['total'].astype(float)
    
    # Some hours are missing, light the nights, so we set zero
    df = df.reindex(pd.date_range(start=df.index[0], end=df.index[-1], freq="1H"), fill_value=0)

    df = checkNaNs(df)
    
    return df

def checkNaNs(df):
    print("Length of dataframe:", len(df))
    print("Number of NaNs:", len(df) - df.count())

    df = df.dropna()

    print("Length of dataframe after dropping NaNs:", len(df))

    return df

def calculateMatrixProfile(m, df, column):
    hashValue = "matrix-profile-" + column + "-" + str(m) + "-" + hashlib.md5(df.values.tobytes()).hexdigest()
    cachePath = "./cache/" + hashValue + ".npy"
    
    if os.path.isfile(cachePath):
        print("Loading from cache...")
        matrix_profile = np.load(cachePath)
    else:
        data = np.array(df[column].copy().values.tolist())
        matrix_profile = stumpy.stump(data, m=m)

        np.save(cachePath, matrix_profile)

    return matrix_profile[:, 0], matrix_profile[:, 1] 

def plot(df, column, matrix_profile = None, m = None):
    plt.figure(figsize=(15,5))

    if matrix_profile is None:
        plt.plot(df.index, df[column])
        plt.show()
    else:
        plt.subplot(2, 1, 1)
        plt.plot(df.index[m - 1:], df.values[m - 1:])
        plt.subplot(2, 1, 2)
        plt.plot(df.index[m - 1:], matrix_profile)
        plt.show()

def plotFluss(title, index, values, matrix_profile, cac, regime_locations):
    fig, axs = plt.subplots(3, sharex=True, gridspec_kw={'hspace': 0})
    fig.suptitle(title)

    axs[0].plot(index, values)
    axs[1].plot(index, matrix_profile)
    axs[2].plot(index, cac, color='C1')

    for i in range(len(regime_locations)):
        axs[0].axvline(x=index[regime_locations[i]], linestyle="dashed")
        axs[2].axvline(x=index[regime_locations[i]], linestyle="dashed")

    axs[2].set_xlabel("Data: " + str(index[0]) + " - " + str(index[-1]), labelpad=20)

    plt.show()
