import { useRouter } from "next/router";
export default function ShowUser() {
  const router = useRouter();
  return <div>user id: {router.query.userId}</div>;
}
