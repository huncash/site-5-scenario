import { describe, expect, it } from "vitest";

import { chooseAt, resolveNarrative, storyById, walkedSteps } from "./strategyNarrative";

describe("strategyNarrative", () => {
  it("new-line halt keeps more runway than a second expansion push", () => {
    const halt = resolveNarrative("new-line", ["opt", "halt"]);
    const push = resolveNarrative("new-line", ["opt", "push"]);
    expect(halt.runwayMonths).toBeGreaterThan(push.runwayMonths);
    expect(halt.cashHuf).toBeGreaterThan(push.cashHuf);
    expect(halt.tone).toBe("opt");
    expect(push.tone).toBe("pess");
  });

  it("pessimistic lean cut avoids insolvency compared to waiting", () => {
    const cut = resolveNarrative("new-line", ["pess", "cut"]);
    const wait = resolveNarrative("new-line", ["pess", "wait"]);
    expect(cut.runwayMonths).toBeGreaterThan(wait.runwayMonths);
    expect(wait.beMonth).toBeNull();
    expect(cut.beMonth).toBeTruthy();
  });

  it("loan cheap vs flex changes lock-in and climax cash", () => {
    const organic = resolveNarrative("loan-whatif", ["organic"]);
    const cheap = resolveNarrative("loan-whatif", ["loan", "cheap"]);
    const flex = resolveNarrative("loan-whatif", ["loan", "flex"]);
    expect(organic.lockIn).toMatch(/kamat/i);
    expect(cheap.lockIn).toMatch(/kötbér/i);
    expect(flex.lockIn).toMatch(/előtörlesztés/i);
    expect(cheap.beMonth).toBeLessThan(flex.beMonth ?? 99);
    expect(cheap.cashHuf).toBeGreaterThan(flex.cashHuf);
  });

  it("walk advances only after a choice and can rewind", () => {
    const story = storyById("loan-whatif");
    const open = walkedSteps(story, []);
    expect(open).toHaveLength(1);
    expect(open[0]!.step.id).toBe("credit");
    const afterLoan = walkedSteps(story, ["loan"]);
    expect(afterLoan.map((s) => s.step.id)).toEqual(["credit", "terms"]);
    expect(chooseAt(["loan", "cheap"], 0, "organic")).toEqual(["organic"]);
  });
});
