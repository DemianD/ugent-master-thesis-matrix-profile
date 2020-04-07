from unittest import TestCase
from unittest.mock import patch, mock_open

from distancematrix.calculator import AnytimeCalculator
from distancematrix.generator.znorm_euclidean import ZNormEuclidean
from distancematrix.consumer.matrix_profile_lr import MatrixProfileLR

import numpy as np
from src.series import Series

m = 10

# Create some random data
np.random.seed(123)
data = np.array(np.random.rand(100))

# Calculate the matrix profile
calculator = AnytimeCalculator(m, [data])
generator = calculator.add_generator(0, ZNormEuclidean(noise_std=0.))  # Generator 0 works on channel 0
consumer = calculator.add_consumer([0], MatrixProfileLR()) 
calculator.calculate_diagonals()

# The matrix profile
left_matrix_profile = consumer.matrix_profile_left
right_matrix_profile = consumer.matrix_profile_right

class TestSeries(TestCase):

    def test_it_should_open_the_result_file_as_appending(self):
        mock = mock_open()

        with patch('builtins.open', mock):
            series = Series('key', m, 1000, 'test.csv')

        mock.assert_called_once_with('test.csv', 'a')

    def test_it_should_write_the_correct_values_when_the_series_window_has_not_been_reached(self):
        mock = mock_open()

        with patch('builtins.open', mock):
            series = Series('key', m, 1000, 'test.csv')

            for i in range(0, 100):
                series.add(str(i), data[i])

        mock.assert_called_once_with('test.csv', 'a')

        # The first distance for the LMP will be at index 1 + exclusion_zone (which is default m//2)
        currentIndex = 1 + m//2

        for call in mock().write.call_args_list:
            args, kwargs = call
            index, distance = args[0].split('\t')
            
            self.assertEqual(currentIndex, int(index))
            self.assertAlmostEqual(left_matrix_profile[currentIndex], float(distance))

            currentIndex += 1
