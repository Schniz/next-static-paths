import { it, expect, describe } from "vitest";
import { getHelperJsDocs } from "../cli/helperJsDocs";

describe("helperJsDocs", () => {
  it("returns undefined when no helper is generated", () => {
    const helper = getHelperJsDocs("");
    expect(helper).toBeUndefined();
  });

  it("returns a helper", () => {
    const helper = getHelperJsDocs(`
      // @pathHelper pathName
    `);

    expect(helper).toEqual<typeof helper>({
      name: "pathNamePath",
    });
  });
});
