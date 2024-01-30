import type { ReactElement } from "react";

export type CardProps = {
  children: ReactElement;
};
export const Card: React.FC<CardProps> = ({ children }) => {
  return <div className="rounded shadow p-8 bg-white">{children}</div>;
};
