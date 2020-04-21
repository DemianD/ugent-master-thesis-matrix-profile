import React, { useState, useEffect, useRef } from 'react';
import Highcharts from 'highcharts/highstock.src';
import HighchartsBoost from 'highcharts/modules/boost';
import HighchartsReact from 'highcharts-react-official';

HighchartsBoost(Highcharts);

const Chart = ({ className, dataPoints }) => {
  const [options, setOptions] = useState({
    time: {
      useUTC: false,
    },
    boost: {
      enabled: true,
      useGPUTranslations: true,
      debug: {
        timeSetup: true,
        timeSeriesProcessing: true,
      },
    },
    rangeSelector: {
      enabled: true,
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
      enabled: true,
    },
    scrollbar: {
      enabled: false,
    },
    chart: {
      zoomType: 'x',
      panning: true,
      panKey: 'shift',
      backgroundColor: 'transparent',
    },
    credits: {
      enabled: false,
    },
    series: [
      {
        data: [],
        color: '#032b86',
        lineWidth: 1,
      },
    ],
  });

  useEffect(() => {
    console.log('Updating chart');
    setOptions((o) => ({
      series: { data: dataPoints },
    }));
  }, [dataPoints]);

  return (
    <div className={className}>
      <HighchartsReact highcharts={Highcharts} options={options} constructorType={'stockChart'} />
    </div>
  );
};

export default Chart;
