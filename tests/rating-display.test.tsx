import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RatingDisplay, RatingSummary } from "@/components/rating-display";
import type { CategoryScores } from "@/lib/rating";

describe("RatingDisplay", () => {
  it("renders the thumb emoji for an exact category score", () => {
    render(<RatingDisplay score={2} label="Taste" />);
    expect(screen.getByText("👍👍")).toBeInTheDocument();
    expect(screen.getByText("Taste")).toBeInTheDocument();
    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  it("renders the nearest thumb and exact numeric value for a fractional overall", () => {
    render(<RatingDisplay score={1.5} label="Overall" />);
    // 1.5 rounds to the "Excellent" (+2) thumb, but the precise value is shown too.
    expect(screen.getByText("👍👍")).toBeInTheDocument();
    expect(screen.getByText("+1.5")).toBeInTheDocument();
  });

  it("hides the numeric score when showScore is false", () => {
    render(<RatingDisplay score={0} label="Foam" showScore={false} />);
    expect(screen.getByText("🤷")).toBeInTheDocument();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("exposes an accessible label combining the caption, thumb meaning, and value", () => {
    render(<RatingDisplay score={-2} label="Cost" />);
    expect(
      screen.getByLabelText("Cost Terrible -2"),
    ).toBeInTheDocument();
  });
});

describe("RatingSummary", () => {
  // Chosen so every formatted score (each category + the overall) is a
  // distinct string - keeps the getByText queries below unambiguous.
  const scores: CategoryScores = { taste: 2, atmosphere: -2, foam: 1, cost: -1 };

  it("renders all four categories plus the computed overall", () => {
    render(<RatingSummary scores={scores} />);
    expect(screen.getByText("Overall")).toBeInTheDocument();
    expect(screen.getByText("Taste")).toBeInTheDocument();
    expect(screen.getByText("Atmosphere")).toBeInTheDocument();
    expect(screen.getByText("Foam")).toBeInTheDocument();
    expect(screen.getByText("Cost")).toBeInTheDocument();
    // Each category score is rendered distinctly.
    expect(screen.getByText("+2")).toBeInTheDocument();
    expect(screen.getByText("-2")).toBeInTheDocument();
    expect(screen.getByText("+1")).toBeInTheDocument();
    expect(screen.getByText("-1")).toBeInTheDocument();
    // sum = 0, average = 0 -> overall "0"
    expect(screen.getByLabelText("Overall Okay 0")).toBeInTheDocument();
  });

  it("uses a precomputed overall instead of recomputing when provided", () => {
    render(<RatingSummary scores={scores} overall={-1.5} />);
    expect(screen.getByText("-1.5")).toBeInTheDocument();
  });
});
