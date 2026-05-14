import { ReactNode } from "react";

export const metadata = {
  title: "Станції | ЕкоМонітор",
  description: "Детальна інформація про моніторингові станції",
};

interface StationsLayoutProps {
  children: ReactNode;
}

export default function StationsLayout({ children }: StationsLayoutProps) {
  return children;
}
