import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationProvider, type NotifyOptions, UNDO_MS, useNotify } from "./Notifications";

function Trigger({ options, label = "go" }: { options: NotifyOptions; label?: string }) {
  const notify = useNotify();
  return <button onClick={() => notify(options)}>{label}</button>;
}
const setup = (ui: React.ReactElement) => {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<NotificationProvider>{ui}</NotificationProvider>);
  return user;
};
const tick = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("notifications with Undo", () => {
  it("keeps an Undo available for about eight seconds, then removes it", async () => {
    const user = setup(<Trigger options={{ title: "Removed Swift", action: { label: "Undo", onClick: vi.fn() } }} />);
    await user.click(screen.getByRole("button", { name: "go" }));
    expect(UNDO_MS).toBe(8000);
    tick(7500);
    expect(screen.getByRole("button", { name: "Undo" })).toBeInTheDocument();
    tick(700);
    expect(screen.queryByRole("button", { name: "Undo" })).not.toBeInTheDocument();
  });

  it("runs the action once and dismisses the notice when Undo is pressed", async () => {
    const onUndo = vi.fn();
    const user = setup(<Trigger options={{ title: "Removed Swift", action: { label: "Undo", onClick: onUndo } }} />);
    await user.click(screen.getByRole("button", { name: "go" }));
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Removed Swift")).not.toBeInTheDocument();
  });

  it("pauses the countdown while the pointer is over it", async () => {
    const user = setup(<Trigger options={{ title: "Removed Swift", action: { label: "Undo", onClick: vi.fn() } }} />);
    await user.click(screen.getByRole("button", { name: "go" }));
    await user.hover(screen.getByRole("status"));
    tick(60_000);
    expect(screen.getByRole("button", { name: "Undo" })).toBeInTheDocument();
    await user.unhover(screen.getByRole("status"));
    tick(UNDO_MS + 200);
    expect(screen.queryByRole("button", { name: "Undo" })).not.toBeInTheDocument();
  });

  it("pauses the countdown while the Undo button has keyboard focus", async () => {
    const user = setup(<Trigger options={{ title: "Removed Swift", action: { label: "Undo", onClick: vi.fn() } }} />);
    await user.click(screen.getByRole("button", { name: "go" }));
    screen.getByRole("button", { name: "Undo" }).focus();
    tick(60_000);
    expect(screen.getByRole("button", { name: "Undo" })).toBeInTheDocument();
  });

  it("handles consecutive removals independently, each with its own Undo", async () => {
    const first = vi.fn();
    const second = vi.fn();
    const user = setup(
      <>
        <Trigger label="one" options={{ title: "Removed Swift", action: { label: "Undo", onClick: first } }} />
        <Trigger label="two" options={{ title: "Removed Creta", action: { label: "Undo", onClick: second } }} />
      </>,
    );
    await user.click(screen.getByRole("button", { name: "one" }));
    await user.click(screen.getByRole("button", { name: "two" }));
    const undos = screen.getAllByRole("button", { name: "Undo" });
    expect(undos).toHaveLength(2);
    await user.click(undos[0]);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).not.toHaveBeenCalled();
    expect(screen.getByText("Removed Creta")).toBeInTheDocument();
    expect(screen.queryByText("Removed Swift")).not.toBeInTheDocument();
  });

  it("announces errors as alerts and everything else politely, and can be dismissed", async () => {
    const user = setup(
      <>
        <Trigger label="bad" options={{ tone: "error", title: "Something failed" }} />
        <Trigger label="good" options={{ tone: "success", title: "Saved" }} />
      </>,
    );
    await user.click(screen.getByRole("button", { name: "bad" }));
    await user.click(screen.getByRole("button", { name: "good" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Something failed");
    expect(screen.getByRole("status")).toHaveTextContent("Saved");
    await user.click(screen.getByRole("button", { name: "Dismiss: Saved" }));
    expect(screen.queryByText("Saved")).not.toBeInTheDocument();
  });
});
