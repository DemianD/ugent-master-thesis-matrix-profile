import yarrrml from '@rmlio/yarrrml-parser/lib/rml-generator.js';
import stringifyQuads from '../../utils/stringifyQuads.js';

const convertYarrrmlToRML = content => {
  const quads = new yarrrml().convert(content);

  return stringifyQuads(quads);
};

export default convertYarrrmlToRML;
