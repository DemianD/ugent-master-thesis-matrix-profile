import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts/highstock.src';
import HighchartsBoost from 'highcharts/modules/boost';
import HighchartsReact from 'highcharts-react-official';

HighchartsBoost(Highcharts);

const Chart = ({ className, dataPoints, bands, name, min, max }) => {
  const [options, setOptions] = useState({
    time: {
      useUTC: false,
    },
    xAxis: {
      min,
      max,
      plotBands: bands,
    },
    boost: {
      enabled: true,
      useGPUTranslations: true,
      debug: {
        timeSetup: true,
        timeSeriesProcessing: true,
      },
    },
    legend: { enabled: true },
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
        name,
        data: [],
        color: '#032b86',
        lineWidth: 1,
      },
    ],
  });

  useEffect(() => {
    if (dataPoints.length > 0) {
      console.log('Updating chart');
      setOptions((o) => ({
        xAxis: {
          min,
          max,
          plotBands: bands,
        },
        series: { data: dataPoints },
      }));
    }
  }, [bands, dataPoints, max, min]);

  return (
    <div className={className}>
      <HighchartsReact highcharts={Highcharts} options={options} constructorType={'stockChart'} />
    </div>
  );
};

Chart.defaultProps = {
  dataPoints: [],
};

export default Chart;
