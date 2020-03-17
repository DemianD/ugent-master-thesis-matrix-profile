# Analysis

## readFilesToDataFrame

```python
folder = "./data/"
df = readFilesToDataFrame("./data/")
```

The return value is a [pandas DataFrame](https://pandas.pydata.org/pandas-docs/stable/reference/frame.html). You can use this DataFrame for example to take a rolling average or take a subset of the data.

**Apply a rolling average for every 60 observations:**

```python
result = df.rolling(window = 60).mean()
```

**Take the last 3 months of data:**

```python
result = df.last('3M')
```
