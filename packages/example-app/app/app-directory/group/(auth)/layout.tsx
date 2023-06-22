import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function AuthLayout(props: Props) {
  const { children } = props;

  return (
    <div>
      <div>Auth</div>
      <div>{children}</div>
    </div>
  );
}
