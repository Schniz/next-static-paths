import { ArgObject, argObjectToTypeString } from "./argObject";

export interface HelperJsDocs {
  name: string;
}

export function getHelperJsDocs(contents: string): HelperJsDocs | undefined {
  const helperNameMatches = contents.match(/@pathHelper ([a-zA-Z0-9_]+)/);
  if (!helperNameMatches || !helperNameMatches[1]) return;
  return { name: `${helperNameMatches[1]}Path` };
}

export function generateHelperCode(
  { name }: HelperJsDocs,
  pathname: string,
  argsObject: ArgObject,
) {
  const comment = `/** A helper for ${pathname} */`;
  const argKeys = Object.keys(argsObject);
  if (argKeys.length === 0) {
    return `${comment}\nexport const ${name} = ${JSON.stringify(pathname)}`;
  }

  const literal = pathname
    .replace(/\[\.\.\.([^\]]+)\]/g, (_, paramName) => {
      return `\${params.${paramName}.map(encodeURIComponent).join('/')}`;
    })
    .replace(/\[([^\]]+)\]/g, (_, paramName) => {
      return `\${encodeURIComponent(params.${paramName})}`;
    });

  const objectType = argObjectToTypeString(argsObject);

  const definition = `
    ${comment}
    export function ${name}(params: ${objectType}): string {
      return \`${literal}\`;
    }
  `;

  return definition;
}
