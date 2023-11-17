export default function Splat({ params }: { params: Record<string, unknown> }) {
  return <div>rest: {JSON.stringify(params)}</div>;
}
