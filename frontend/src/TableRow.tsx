import React from "react";
import { UrlInfo } from './types/UrlInfo';

interface TableRowProps {
  data: UrlInfo;
}

const TableRow: React.FC<TableRowProps> = ({ data: { url, statusCode, contentLength, responseTime }}) => {
  return (
    <tr>
      <td>{url || '-'}</td>
      <td>{statusCode || '-'}</td>
      <td>{contentLength}</td>
      <td>{responseTime}</td>
    </tr>
  );
};

export default React.memo(TableRow);
