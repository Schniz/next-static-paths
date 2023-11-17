export default function RestPropsPage({
  params,
}: {
  params: { userId: string };
}) {
  return <div>user id: {params.userId}</div>;
}
