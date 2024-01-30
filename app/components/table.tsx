import type { TableRowProps } from "./table-row";
import { TableRow } from "./table-row";

export type TableProps = {
  children: Array<TableRowProps>;
};

export const Table: React.FC<TableProps> = ({ children }) => {
  return (
    <ul className="divide-y divide-solid">
      {children?.map((child, index) => TableRow({ ...child }))}
    </ul>
  );
};
