from distancematrix.calculator import StreamingCalculator
from distancematrix.generator.znorm_euclidean import ZNormEuclidean
from distancematrix.consumer.matrix_profile_lr import ShiftingMatrixProfileLR

class Series:
    def __init__(self, key, window_sizes, series_window, results_folder):
        self.key = key
        self.dates = []
        self.window_sizes = window_sizes
        self.series_window = series_window
        self.results_folder = results_folder

        self.number_of_values = 0

        self.streamingCalculators = {} 

        for m in window_sizes:
            calculator = StreamingCalculator(m, series_window)
            generator = calculator.add_generator(0, ZNormEuclidean(noise_std=0.))
            consumer = calculator.add_consumer([0], ShiftingMatrixProfileLR())

            self.streamingCalculators[m] = {
                'calculator': calculator,
                'consumer': consumer,
                'resultsFile': results_folder + '/' + str(m) + '.txt'
            }

        self.openFiles()

    def add(self, date, value):
        self.number_of_values += 1
        self.dates.append(date)

        for m in self.window_sizes:
            exclusion_zone = m // 2
            self.streamingCalculators[m]['calculator'].append_series([value])

            # Left matrix profile
            # the first distance will be calculated when there are 1 + exclusion_zone + m observations
            if self.number_of_values < 1 + exclusion_zone + m:
                continue
        
            self.streamingCalculators[m]['calculator'].calculate_columns()

            dateForDistance = self.dates[self.number_of_values - m]

            if self.series_window - self.number_of_values >= 0:
                # The rolling hasn't started 
                distance = self.streamingCalculators[m]['consumer'].matrix_profile_left[self.number_of_values - m]
                index = self.streamingCalculators[m]['consumer'].profile_index_left[self.number_of_values - m]
            else:
                # The rolling has now started, and the new value is at the back
                distance = self.streamingCalculators[m]['consumer'].matrix_profile_left[-1]
                index = self.streamingCalculators[m]['consumer'].profile_index_left[-1]

            self.writeLine(m, dateForDistance, distance, self.dates[index])

    def writeLine(self, m, date, distance, index):
        self.files[m].write(date + '\t' + str(distance) + '\t' + str(index) + '\n')
        self.files[m].flush()

    def openFiles(self):
        self.files = {}

        for m in self.window_sizes:
            self.files[m] = open(self.streamingCalculators[m]['resultsFile'], 'a')

    def __del__(self):
        if hasattr(self, 'files'):
            for m in self.window_sizes:
                self.files[m].close()

    def __getstate__(self):
        state = self.__dict__.copy()

        # Remove the result file as it is not pickable
        del state['files']

        return state

    def __setstate__(self, state):
        self.__dict__.update(state)
        self.openFiles()
