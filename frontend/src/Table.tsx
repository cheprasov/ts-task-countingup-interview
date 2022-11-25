import React, { useMemo, useState } from "react";
import TableRow from './TableRow';
import { UrlInfo } from './types/UrlInfo';
import { round } from './utils/round';

interface TableProps {
  data: UrlInfo[];
}

const Table: React.FC<TableProps> = ({ data }) => {

  const [ sortField, setSortField ] = useState<string>('');
  const [ sortOrderAsc, setSortOrderAsc ] = useState<boolean>(true);

  const averageData = useMemo(() => {
    let count = 0;
    let sumResponseTime = 0;
    let sumContentLength = 0;
    data.forEach((urlInfo) => {
      // if (urlInfo.statusCode !== 200) {
      //   return;
      // }
      count += 1;
      sumResponseTime += urlInfo.responseTime;
      sumContentLength += urlInfo.contentLength;
    });
    return {
      url: '',
      statusCode: 0,
      responseTime: round(sumResponseTime / (count || 1)),
      contentLength: round(sumContentLength / (count || 1)),
    } as UrlInfo
  }, [data])

  const sortedRows = useMemo(() => {
    const sortedData = Array.from(data);
    if (sortField) {
      sortedData.sort((a, b) => {
        if (a[sortField] < b[sortField]) {
          return -1 * (sortOrderAsc ? 1 : -1);
        }
        if (a[sortField] > b[sortField]) {
          return 1 * (sortOrderAsc ? 1 : -1);
        }
        return 0;
        // return (a[sortField] - b[sortField]) * (sortOrderAsc ? 1 : -1);
      });
    }
    return sortedData.map((urlInfo) => {
      // in case we have url duplicates
      const key = `${urlInfo.url}:${urlInfo.statusCode}:${urlInfo.responseTime}:${urlInfo.contentLength}`;
      return (
        <TableRow
          key={key}
          data={urlInfo}
        />
      );
    });
  }, [data, sortField, sortOrderAsc]);

  const header = useMemo(() => {
    const onTabHeaderClick = (field: keyof UrlInfo) => {
      if (sortField === field) {
        setSortOrderAsc((asc) => !asc);
      } else {
        setSortField(field);
      }
    };

    return ([
      ['url', 'URL'],
      ['statusCode', 'Status Code'],
      ['contentLength', 'Content Length'],
      ['responseTime', 'Response Time'],
    ] as [keyof UrlInfo, string][]
    ).map(([field, label]) => {
      return (
        <th
          key={field}
          onClick={() => onTabHeaderClick(field)}
        >
          {label}
          { field === sortField && (
            sortOrderAsc ? ' ^' : ' v'
          ) }
        </th>
      );
    });
  }, [sortField, sortOrderAsc]);

  return (
    <table>
      <thead>
        <tr>
          {header}
        </tr>
      </thead>

      <tbody>
        {sortedRows}
        <TableRow data={averageData} />
      </tbody>
    </table>
  );
};

export default React.memo(Table);
