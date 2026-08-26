import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ConstraintEditor } from "./ConstraintEditor";

describe("ConstraintEditor", () => {
  it("calls onRoomsChange with a new room when the add-room form is submitted", () => {
    const onRoomsChange = vi.fn();
    render(
      <ConstraintEditor
        rooms={[]}
        constraints={[]}
        onRoomsChange={onRoomsChange}
        onConstraintsChange={vi.fn()}
        onRegenerate={vi.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText("New room name"), { target: { value: "Garage" } });
    fireEvent.click(screen.getByText("Add room"));

    expect(onRoomsChange).toHaveBeenCalledWith([
      expect.objectContaining({ name: "Garage", weight: 1 }),
    ]);
  });

  it("does not add a room when the name field is empty", () => {
    const onRoomsChange = vi.fn();
    render(
      <ConstraintEditor
        rooms={[]}
        constraints={[]}
        onRoomsChange={onRoomsChange}
        onConstraintsChange={vi.fn()}
        onRegenerate={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText("Add room"));

    expect(onRoomsChange).not.toHaveBeenCalled();
  });

  it("lists existing rooms with a labeled remove button", () => {
    render(
      <ConstraintEditor
        rooms={[{ id: "r1", name: "Kitchen", weight: 1 }]}
        constraints={[]}
        onRoomsChange={vi.fn()}
        onConstraintsChange={vi.fn()}
        onRegenerate={vi.fn()}
      />
    );

    expect(screen.getByText("Kitchen")).toBeInTheDocument();
    expect(screen.getByLabelText("Remove Kitchen")).toBeInTheDocument();
  });

  it("calls onConstraintsChange when requiring adjacency between two selected rooms", () => {
    const onConstraintsChange = vi.fn();
    render(
      <ConstraintEditor
        rooms={[
          { id: "r1", name: "Kitchen", weight: 1 },
          { id: "r2", name: "Living Room", weight: 1 },
        ]}
        constraints={[]}
        onRoomsChange={vi.fn()}
        onConstraintsChange={onConstraintsChange}
        onRegenerate={vi.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText("First room"), { target: { value: "r1" } });
    fireEvent.change(screen.getByLabelText("Second room"), { target: { value: "r2" } });
    fireEvent.click(screen.getByText("Require adjacency"));

    expect(onConstraintsChange).toHaveBeenCalledWith([{ a: "r1", b: "r2" }]);
  });
});
