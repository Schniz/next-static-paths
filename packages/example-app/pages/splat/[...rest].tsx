import { useRouter } from "next/router";
export default function ShowUser() {
  const router = useRouter();
  return <div>rest: {JSON.stringify(router.query.rest)}</div>;
}
