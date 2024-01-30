export type TableProps = {
  children: Array<TableRowProps>;
};

export const SearchForm: React.FC<TableProps> = ({ children }) => {
  return (
    <ul className="divide-y divide-solid">
      {children?.map((child, index) => TableRow({ ...child }))}
    </ul>
  );
};
