import sys
sys.path.append("..")

from utils import readFilesToDataFrame, plot

df = readFilesToDataFrame("./data/")
result = df.rolling(window = 60).mean().last('1M')

plot(result)
