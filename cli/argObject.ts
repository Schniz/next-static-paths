export type ArgumentType = "string" | "variadic";
export type ArgObject = { [arg: string]: ArgumentType };

export function getArgumentsFromPath(pathname: string): ArgObject {
  const matches = pathname.match(/\[([^\]]+)\]/g);
  const output: ArgObject = {};
  if (!matches) {
    return output;
  }
  for (const match of matches) {
    const argumentName = match.slice(1, -1);
    if (argumentName.startsWith("...")) {
      output[argumentName.slice(3)] = "variadic";
    } else {
      output[argumentName] = "string";
    }
  }
  return output;
}

export function argObjectToTypeString(argObject: ArgObject): string {
  const entries = Object.entries(argObject);
  if (!entries.length) {
    return "Record<never, never>";
  }
  const properties = entries.map(([key, value]) => {
    const valueType = value === "variadic" ? "string[]" : "string";
    return `${JSON.stringify(key)}: ${valueType}`;
  });
  return `{${properties.join(", ")}}`;
}
