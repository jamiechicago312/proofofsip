import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RatingInput } from "@/components/rating-input";
import type { RatingScore } from "@/lib/rating";

describe("RatingInput", () => {
  it("renders five options with the category as the group label", () => {
    render(<RatingInput category="taste" value={0} onChange={() => {}} />);

    expect(screen.getByRole("group", { name: "Taste" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(5);
  });

  it("marks the option matching the current value as checked", () => {
    render(<RatingInput category="foam" value={1} onChange={() => {}} />);

    const good = screen.getByRole("radio", { name: "Very good" });
    expect(good).toBeChecked();
    expect(screen.getByRole("radio", { name: "Exceptional" })).not.toBeChecked();
  });

  it("calls onChange with the selected score on click", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(value: RatingScore) => void>();
    render(<RatingInput category="cost" value={0} onChange={onChange} />);

    await user.click(screen.getByRole("radio", { name: "Poor" }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(-2);
  });

  it("supports keyboard interaction: tab to the group, arrow keys to change selection", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(value: RatingScore) => void>();
    render(<RatingInput category="atmosphere" value={0} onChange={onChange} />);

    await user.tab();
    expect(screen.getByRole("radio", { name: "Average" })).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it("does not fire onChange when disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(value: RatingScore) => void>();
    render(
      <RatingInput category="taste" value={0} onChange={onChange} disabled />,
    );

    await user.click(screen.getByRole("radio", { name: "Exceptional" }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it("uses an explicit label over the category default, and a custom name", () => {
    render(
      <RatingInput
        label="Custom caption"
        name="my-group"
        value={0}
        onChange={() => {}}
      />,
    );

    expect(
      screen.getByRole("group", { name: "Custom caption" }),
    ).toBeInTheDocument();
    const radios = screen.getAllByRole("radio") as HTMLInputElement[];
    expect(radios.every((radio) => radio.name === "my-group")).toBe(true);
  });

  it("shows every option's plain-language word, not just an icon", () => {
    render(<RatingInput category="taste" value={0} onChange={() => {}} />);
    for (const word of ["Poor", "Fair", "Average", "Very good", "Exceptional"]) {
      expect(screen.getByText(word)).toBeInTheDocument();
    }
  });
});
