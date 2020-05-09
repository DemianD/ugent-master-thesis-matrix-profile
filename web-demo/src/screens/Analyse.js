import React, { useState } from 'react';
import { H1, H2 } from '../components/Heading';
import useComunica from '../hooks/useComunica';
import { getTreeCollections, getLabelForSubject } from '../queries';
import ComunicaLink from '../components/ComunicaLink';
import Content from '../components/Content';
import Checkbox from '../components/Checkbox';
import Input from '../components/Input';
import Label from '../components/Label';
import AnalyseCollection from '../components/AnalyseCollection';
import RadioButton from '../components/RadioButton';
import RadioButtonGroup from '../components/RadioButtonGroup';

const today = new Date();
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

const pad = (x) => {
  return x < 10 ? '0' + x : x;
};

const format = (date) => {
  if (!date) {
    return '';
  }

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
};

const Analyse = ({ location }) => {
  const [checkedCollections, setCheckedCollections] = useState([]);
  const [matrixProfiles, setMatrixProfiles] = useState({});
  const subject = decodeURIComponent(location.search).replace('?query=', '');

  const [labels] = useComunica(subject, getLabelForSubject(subject), true);
  const [collectionsWithMatrixProfile] = useComunica(subject, getTreeCollections, true);

  const [fromDate, setFromDate] = useState(yesterday);
  const [toDate, setToDate] = useState(today);

  const collections = {};

  collectionsWithMatrixProfile.forEach((c) => {
    if (!collections[c.get('?url').value]) {
      collections[c.get('?url').value] = [];
    }

    // ?matrixProfile is optional
    if (c.get('?matrixProfile')) {
      collections[c.get('?url').value].push(c.get('?matrixProfile').value);
    }
  });

  const filteredCollections = Object.entries(checkedCollections)
    .filter(([s, checked]) => !!checked)
    .map(([s]) => s);

  const label = labels[0] && labels[0].get('?label').value;

  return (
    <>
      <H1 className="mt-8">
        Analyse {label} <ComunicaLink datasource={subject} query={getLabelForSubject(subject)} />
      </H1>

      <Content className="mt-10">
        <section>
          <H2>Interval</H2>
          <div className="flex">
            <div>
              <Label>From</Label>
              <Input
                type="datetime-local"
                placeholder="from"
                className="mr-2"
                defaultValue={fromDate && format(new Date(fromDate))}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div>
              <Label>To</Label>
              <Input
                type="datetime-local"
                placeholder="to"
                className="ml-2"
                defaultValue={toDate && format(new Date(toDate))}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>
        </section>
        <section className="mt-10">
          <H2>
            Available collections <ComunicaLink datasource={subject} query={getTreeCollections} />
          </H2>
          <ul>
            {Object.entries(collections).map(([collection, matrixProfiles]) => {
              return (
                <li key={collection}>
                  <Checkbox
                    id={collection}
                    onClick={(_, isChecked) =>
                      setCheckedCollections((c) => ({ ...c, [collection]: isChecked }))
                    }
                  >
                    {collection}
                  </Checkbox>
                  <RadioButtonGroup
                    className="ml-3 mt-2"
                    name={collection}
                    onChange={(mp) => setMatrixProfiles((x) => ({ ...x, [collection]: mp }))}
                  >
                    {matrixProfiles.map((mp) => (
                      <RadioButton key={mp} value={mp}>
                        {mp}
                      </RadioButton>
                    ))}
                  </RadioButtonGroup>
                </li>
              );
            })}
          </ul>
        </section>

        {filteredCollections.map((collectionSubject) => (
          <section className="mt-10" key={collectionSubject}>
            <AnalyseCollection
              fromDate={fromDate}
              toDate={toDate}
              subject={collectionSubject}
              matrixProfileSubject={matrixProfiles[collectionSubject]}
            />
          </section>
        ))}
      </Content>
    </>
  );
};

export default Analyse;
