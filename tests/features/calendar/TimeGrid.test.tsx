import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { TimeGrid } from "@/features/calendar/TimeGrid";

vi.mock("@/features/calendar/EventDetailPopover", () => ({
  EventDetailPopover: ({ children }: { children: ReactNode }) => children,
}));

describe("TimeGrid", () => {
  it("passes the clicked half-hour slot to schedule creation", () => {
    const onCreate = vi.fn();
    render(
      <TimeGrid
        days={[new Date(2026, 8, 25)]}
        events={[]}
        onCreate={onCreate}
        onEdit={vi.fn()}
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Add schedule Fri Sep 25 2026 9:30" }));
    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onCreate.mock.calls[0]?.[0]).toEqual(new Date(2026, 8, 25, 9, 30));
  });

  it("shows the current-time line and 24-hour times on today's grid", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 25, 14, 20));
    try {
      const { unmount } = render(
        <TimeGrid
          days={[new Date(2026, 8, 25)]}
          events={[
            {
              id: "current-event",
              calendarId: "primary",
              summary: "Ongoing meeting",
              start: { dateTime: new Date(2026, 8, 25, 14).toISOString() },
              end: { dateTime: new Date(2026, 8, 25, 15).toISOString() },
            },
            {
              id: "event-1",
              calendarId: "primary",
              summary: "Design review",
              start: { dateTime: new Date(2026, 8, 25, 15).toISOString() },
              end: { dateTime: new Date(2026, 8, 25, 16).toISOString() },
            },
          ]}
          onCreate={vi.fn()}
          onEdit={vi.fn()}
          onDuplicate={vi.fn()}
          onDelete={vi.fn()}
        />,
      );
      expect(screen.getByTestId("current-time-indicator")).toHaveTextContent("14:20");
      expect(screen.getAllByTestId("current-event-bracket")).toHaveLength(1);
      expect(screen.getByRole("button", { name: /Ongoing meeting/ })).toHaveStyle({
        outline: "2px solid #60a5fa",
      });
      expect(screen.getByText("09:00")).toBeInTheDocument();
      expect(screen.getByText("15:00 – 16:00")).toBeInTheDocument();
      unmount();
    } finally {
      vi.useRealTimers();
    }
  });
});
