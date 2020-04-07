from distancematrix.calculator import StreamingCalculator
from distancematrix.generator.znorm_euclidean import ZNormEuclidean
from distancematrix.consumer.matrix_profile_lr import ShiftingMatrixProfileLR

class Series:
    def __init__(self, key, m, series_window, result_path):
        self.m = m
        self.key = key
        self.dates = []

        self.number_of_values = 0
        self.exclusion_zone = m // 2
        self.series_window = series_window

        self.calculator = StreamingCalculator(self.m, self.series_window)

        self.generator = self.calculator.add_generator(0, ZNormEuclidean(noise_std=0.))
        self.consumer = self.calculator.add_consumer([0], ShiftingMatrixProfileLR())

        self.result_path = result_path
        self.openFile()

    def add(self, date, value):
        self.number_of_values += 1

        self.calculator.append_series([value])
        self.dates.append(date)

        # Left matrix profile
        # the first distance will be calculated when there are 1 + exclusion_zone + m observations
        if self.number_of_values < 1 + self.exclusion_zone + self.m:
            return
        
        self.calculator.calculate_columns()

        dateForDistance = self.dates[self.number_of_values - self.m]

        if self.series_window - self.number_of_values >= 0:
            # The rolling hasn't started 
            distance = self.consumer.matrix_profile_left[self.number_of_values - self.m]
        else:
            # The rolling has now started, and the new value is at the back
            distance = self.consumer.matrix_profile_left[-1]

        self.writeLine(dateForDistance, distance)

    def writeLine(self, date, distance):
        # print(self.key + ': ' + date + '\t' + str(distance))

        self.result_file.write(date + '\t' + str(distance) + '\n')
        self.result_file.flush()

    def openFile(self):
        self.result_file = open(self.result_path, 'a')

    def __del__(self):
        if hasattr(self, 'result_file'):
            self.result_file.close()

    def __getstate__(self):
        state = self.__dict__.copy()

        # Remove the result file as it is not pickable
        del state['result_file']

        return state

    def __setstate__(self, state):
        self.__dict__.update(state)
        self.openFile()
