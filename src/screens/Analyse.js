import React, { useState } from 'react';
import { H1, H2 } from '../components/Heading';
import useComunica from '../hooks/useComunica';
import { getTreeCollections, getLabelForSubject } from '../queries';
import ComunicaLink from '../components/ComunicaLink';
import Content from '../components/Content';
import Checkbox from '../components/Checkbox';
import ObservationsChart from '../components/ObservationsChart';
import Input from '../components/Input';
import Label from '../components/Label';
import { GREATER_THAN_OR_EQUAL_TO, LESS_THAN_OR_EQUAL_TO } from '../query/TreeQuery';

const today = new Date();
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

const pad = (x) => {
  return x < 10 ? '0' + x : x;
};

const format = (date) => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
};

const Analyse = ({ location }) => {
  const [checkedCollections, setCheckedCollections] = useState([]);
  const subject = decodeURIComponent(location.search).replace('?query=', '');

  const [labels] = useComunica(subject, getLabelForSubject(subject), true);
  const [collections] = useComunica(subject, getTreeCollections, true);

  const [fromDate, setFromDate] = useState(yesterday);
  const [toDate, setToDate] = useState(today);

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
          <H2>
            Available collections <ComunicaLink datasource={subject} query={getTreeCollections} />
          </H2>
          <ul>
            {collections.map((collection) => {
              const subject = collection.get('?s').value;

              return (
                <li key={subject}>
                  <Checkbox
                    id={subject}
                    onClick={(e, isChecked) =>
                      setCheckedCollections((c) => ({ ...c, [subject]: isChecked }))
                    }
                  >
                    {subject}
                  </Checkbox>
                </li>
              );
            })}
          </ul>
        </section>
        <section className="mt-10">
          <H2>Interval</H2>
          <div className="flex">
            <div>
              <Label>From</Label>
              <Input
                type="datetime-local"
                placeholder="from"
                className="mr-2"
                value={format(fromDate)}
                onChange={(e) => setFromDate(new Date(e.target.value))}
              />
            </div>
            <div>
              <Label>To</Label>
              <Input
                type="datetime-local"
                placeholder="to"
                className="ml-2"
                value={format(toDate)}
                onChange={(e) => setToDate(new Date(e.target.value))}
              />
            </div>
          </div>
        </section>
        <section className="mt-10">
          <H2>Visualize</H2>
          {filteredCollections.map((subject) => (
            <ObservationsChart
              key={subject}
              subject={subject}
              filters={[
                {
                  relationType: GREATER_THAN_OR_EQUAL_TO,
                  value: fromDate,
                },
                {
                  relationType: LESS_THAN_OR_EQUAL_TO,
                  value: toDate,
                },
              ]}
            />
          ))}
        </section>
      </Content>
    </>
  );
};

export default Analyse;
