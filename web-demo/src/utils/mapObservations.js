import { SOSA } from './vocs';

const mapObservation = (result) => {
  return [
    new Date(result[SOSA('resultTime').value].value).getTime(),
    parseInt(result[SOSA('hasSimpleResult').value].value),
  ];
};

export default mapObservation;
