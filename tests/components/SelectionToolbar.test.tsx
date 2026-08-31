import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SelectionToolbar } from "@/features/library/SelectionToolbar";

describe("SelectionToolbar", () => {
  it("announces the selected count", () => {
    render(<SelectionToolbar count={3} onBulkTrash={vi.fn()} onClear={vi.fn()} />);
    expect(screen.getByText(/3/)).toBeInTheDocument();
  });

  it("bulk trash forwards the click and shows the destructive label", () => {
    const onBulkTrash = vi.fn();
    render(<SelectionToolbar count={2} onBulkTrash={onBulkTrash} onClear={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /move to trash/i }));
    expect(onBulkTrash).toHaveBeenCalledTimes(1);
  });

  it("clear dismisses the selection", () => {
    const onClear = vi.fn();
    render(<SelectionToolbar count={1} onBulkTrash={vi.fn()} onClear={onClear} />);
    fireEvent.click(screen.getByRole("button", { name: /clear/i }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
