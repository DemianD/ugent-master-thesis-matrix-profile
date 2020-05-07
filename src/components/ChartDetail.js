import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts/highstock.src';
import HighchartsBoost from 'highcharts/modules/boost';
import HighchartsReact from 'highcharts-react-official';

HighchartsBoost(Highcharts);

const ChartDetail = ({ height, datapoints, name, min, max }) => {
  const [options, setOptions] = useState({
    time: {
      useUTC: false,
    },
    xAxis: {
      min,
      max,
    },
    boost: {
      enabled: true,
      useGPUTranslations: true,
      debug: {
        timeSetup: true,
        timeSeriesProcessing: true,
      },
    },
    legend: { enabled: false },
    rangeSelector: {
      enabled: false,
      inputEnabled: false,
      buttons: [
        {
          type: 'minute',
          count: 5,
          text: '5m',
        },
        {
          type: 'hour',
          count: 1,
          text: '1h',
        },
        {
          type: 'all',
          text: 'All',
        },
      ],
    },
    navigator: {
      enabled: false,
    },
    scrollbar: {
      enabled: false,
    },
    chart: {
      height,
      zoomType: '',
      panning: false,
      panKey: 'shift',
      backgroundColor: 'transparent',
    },
    credits: {
      enabled: false,
    },
    series: [
      {
        name,
        data: [],
        color: '#032b86',
        lineWidth: 1,
      },
    ],
  });

  useEffect(() => {
    if (datapoints.length > 0) {
      setOptions((o) => ({
        chart: {
          height,
        },
        xAxis: {
          min,
          max,
        },
        series: { data: datapoints },
      }));
    }
  }, [datapoints, height, max, min]);

  return (
    <HighchartsReact highcharts={Highcharts} options={options} constructorType={'stockChart'} />
  );
};

ChartDetail.defaultProps = {
  height: 400,
};

export default ChartDetail;
