import { getAverageVoteThreshold } from "../components/ReferencePanel/RefPanel";

describe("getAverageVoteThreshold", () => {
  test("ignores negative votes and averages only the linked chapter entries", () => {
    const linkedFromChapter = [
      { from: "Gen.1.1", to: "John.1.1", votes: 10 },
      { from: "Gen.1.2", to: "John.1.2", votes: 20 },
      { from: "Gen.1.3", to: "John.1.3", votes: -30 },
    ];
    const linkedToChapter = [
      { from: "Matt.1.1", to: "John.1.4", votes: 50 },
      { from: "Luke.1.1", to: "John.1.5", votes: 10 },
    ];

    expect(getAverageVoteThreshold(linkedFromChapter, linkedToChapter)).toBe(
      22.5,
    );
  });

  test("returns zero when all relevant votes are negative or missing", () => {
    expect(
      getAverageVoteThreshold(
        [{ from: "Gen.1.1", to: "John.1.1", votes: -5 }],
        [],
      ),
    ).toBe(0);
    expect(getAverageVoteThreshold([], [])).toBe(0);
  });
});
