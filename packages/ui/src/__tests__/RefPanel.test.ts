import { getAverageVoteThreshold } from "../components/ReferencePanel/RefPanel";

describe("getAverageVoteThreshold", () => {
  test("ignores negative votes and averages the remaining values", () => {
    const entries = [
      { from: "Gen.1.1", to: "John.1.1", votes: 10 },
      { from: "Gen.1.2", to: "John.1.2", votes: 20 },
      { from: "Gen.1.3", to: "John.1.3", votes: -30 },
      { from: "Gen.1.4", to: "John.1.4", votes: 50 },
    ];

    expect(getAverageVoteThreshold(entries)).toBe(26.666666666666668);
  });

  test("returns zero when all votes are negative or missing", () => {
    expect(getAverageVoteThreshold([{ from: "Gen.1.1", to: "John.1.1", votes: -5 }])).toBe(0);
    expect(getAverageVoteThreshold([])).toBe(0);
  });
});
