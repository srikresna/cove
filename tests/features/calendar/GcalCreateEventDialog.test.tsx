import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GcalCreateEventDialog } from "@/features/editor/GcalCreateEventDialog";

describe("schedule creation", () => {
  it("creates a timed Google Calendar event with the Task reminder category", () => {
    const onConfirm = vi.fn();
    render(
      <GcalCreateEventDialog
        open
        defaultDate={new Date(2026, 8, 25, 9, 30)}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Task reminder" }));
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Pay invoice" } });
    fireEvent.click(screen.getByRole("button", { name: "Add event" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    const [event, calendarId] = onConfirm.mock.calls[0] ?? [];
    expect(calendarId).toBe("primary");
    expect(event.summary).toBe("Pay invoice");
    expect(event.start.dateTime).toBe(new Date(2026, 8, 25, 9, 30).toISOString());
    expect(event.extendedProperties.private.coveCategory).toBe("task");
  });
});
