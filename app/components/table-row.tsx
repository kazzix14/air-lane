import { Link } from "@remix-run/react";

export type TableRowProps = {
  link: string,
  content: string,
};

export const TableRow: React.FC<TableRowProps> = ({link, content}) => {
  return (
    <li className="p-1">
      <Link to={link} className="hover:opacity-50">
        {content}
      </Link>
    </li>
  );
}
