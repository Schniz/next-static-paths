import { ReactNode } from "react";

export default function Layout(props: { children: ReactNode }) {
  const { children } = props;

  return (
    <div>
      <div>App directory</div>
      <div>{children}</div>
    </div>
  );
}
