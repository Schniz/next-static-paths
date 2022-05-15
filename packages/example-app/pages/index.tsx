import { TypedLink } from "next-static-paths";

export default function Home() {
  return (
    <div>
      Hello, world.{" "}
      <TypedLink as="/">
        <a>Hello</a>
      </TypedLink>
    </div>
  );
}
