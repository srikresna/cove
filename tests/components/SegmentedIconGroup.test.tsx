import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileText, Shapes } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SegmentedIconGroup } from "@/features/editor/SegmentedIconGroup";

const MODE_ITEMS = [
  { value: "page", label: "Page", icon: FileText },
  { value: "edgeless", label: "Edgeless", icon: Shapes },
] as const;

const renderGroup = (ui: React.ReactNode) => render(<TooltipProvider>{ui}</TooltipProvider>);

describe("SegmentedIconGroup", () => {
  it("toggle variant: marks the active segment pressed and reports changes", async () => {
    const onChange = vi.fn();
    renderGroup(
      <SegmentedIconGroup items={MODE_ITEMS} value="page" onChange={onChange} variant="toggle" />,
    );
    const edgeless = screen.getByRole("button", { name: "Edgeless" });
    await userEvent.click(edgeless);
    expect(onChange).toHaveBeenCalledWith("edgeless");
    expect(screen.getByRole("button", { name: "Page" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("tabs variant: exposes tablist semantics with one selected tab", () => {
    renderGroup(
      <SegmentedIconGroup items={MODE_ITEMS} value="page" onChange={() => {}} variant="tabs" />,
    );
    const tablist = screen.getByRole("tablist");
    expect(tablist).toBeTruthy();
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(2);
    expect(tabs[0]?.getAttribute("aria-selected")).toBe("true");
    expect(tabs[1]?.getAttribute("aria-selected")).toBe("false");
    expect(tabs[0]?.tabIndex).toBe(0);
    expect(tabs[1]?.tabIndex).toBe(-1);
  });

  it("tabs variant: arrow keys select with focus (automatic activation)", async () => {
    const onChange = vi.fn();
    renderGroup(
      <SegmentedIconGroup items={MODE_ITEMS} value="page" onChange={onChange} variant="tabs" />,
    );
    const pageTab = screen.getByRole("tab", { name: "Page" });
    pageTab.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith("edgeless");
    expect(screen.getByRole("tab", { name: "Edgeless" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith("page");
  });

  it("slides the active thumb to the selected segment", () => {
    const { container, rerender } = renderGroup(
      <SegmentedIconGroup items={MODE_ITEMS} value="page" onChange={() => {}} />,
    );
    const thumb = container.querySelector<HTMLSpanElement>("span[aria-hidden='true']");
    expect(thumb).not.toBeNull();
    expect(thumb?.style.transform).toBe("translateX(calc(0 * (100% + 0.125rem)))");

    rerender(
      <TooltipProvider>
        <SegmentedIconGroup items={MODE_ITEMS} value="edgeless" onChange={() => {}} />
      </TooltipProvider>,
    );
    expect(thumb?.style.transform).toBe("translateX(calc(1 * (100% + 0.125rem)))");
    expect(thumb?.className).toContain("motion-reduce:transition-none");
  });
});
