import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { TableCheckboxCell } from "../TableCheckboxCell";
import { TableHeaderCell } from "../TableHeaderCell";
import { TableHeaderRow } from "../TableHeaderRow";
import { TableRow } from "./TableRow";
import { TableRowCell } from "../TableRowCell";
import type { SortState } from "../TableHeaderCell";

const meta: Meta = {
  title: "Components/Table/Table",
  tags: ["autodocs"],
};

export default meta;

const ROWS = [
  { id: "01", name: "Home Decor Range",             status: "Ativo",    value: "R$ 4.200" },
  { id: "02", name: "Disney Princess Pink Bag 18'", status: "Pendente", value: "R$ 1.890" },
  { id: "03", name: "Bathroom Essentials",          status: "Inativo",  value: "R$ 720"   },
  { id: "04", name: "Apple Smartwatches",           status: "Ativo",    value: "R$ 9.100" },
];

export const Basic: StoryObj = {
  render: () => (
    <div role="table" className="overflow-auto rounded-200 border border-[#e0e4e9]">
      <div role="rowgroup">
        <TableHeaderRow>
          <TableHeaderCell className="w-[60px] shrink-0">#</TableHeaderCell>
          <TableHeaderCell className="flex-1">Nome</TableHeaderCell>
          <TableHeaderCell className="w-[120px] shrink-0">Status</TableHeaderCell>
          <TableHeaderCell className="w-[120px] shrink-0">Valor</TableHeaderCell>
        </TableHeaderRow>
      </div>
      <div role="rowgroup">
        {ROWS.map((row) => (
          <TableRow key={row.id}>
            <TableRowCell className="w-[60px] shrink-0">{row.id}</TableRowCell>
            <TableRowCell className="flex-1">{row.name}</TableRowCell>
            <TableRowCell className="w-[120px] shrink-0">{row.status}</TableRowCell>
            <TableRowCell className="w-[120px] shrink-0" alignment="right">{row.value}</TableRowCell>
          </TableRow>
        ))}
      </div>
    </div>
  ),
};

function CheckboxTableDemo() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const allSelected = selected.size === ROWS.length;

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(ROWS.map((r) => r.id)));

  return (
    <div role="table" className="overflow-auto rounded-200 border border-[#e0e4e9]">
      <div role="rowgroup">
        <TableHeaderRow>
          <TableCheckboxCell
            checked={allSelected}
            onChange={toggleAll}
            aria-label="Selecionar todos"
            className="border-b border-[#e0e4e9] bg-light-900"
          />
          <TableHeaderCell className="flex-1">Nome</TableHeaderCell>
          <TableHeaderCell className="w-[120px] shrink-0">Status</TableHeaderCell>
          <TableHeaderCell className="w-[120px] shrink-0">Valor</TableHeaderCell>
        </TableHeaderRow>
      </div>
      <div role="rowgroup">
        {ROWS.map((row) => (
          <TableRow key={row.id}>
            <TableCheckboxCell
              checked={selected.has(row.id)}
              onChange={() => toggle(row.id)}
              aria-label={`Selecionar ${row.name}`}
            />
            <TableRowCell className="flex-1">{row.name}</TableRowCell>
            <TableRowCell className="w-[120px] shrink-0">{row.status}</TableRowCell>
            <TableRowCell className="w-[120px] shrink-0" alignment="right">{row.value}</TableRowCell>
          </TableRow>
        ))}
      </div>
    </div>
  );
}

export const WithCheckboxes: StoryObj = {
  render: () => <CheckboxTableDemo />,
};

function SortableTableDemo() {
  const [sort, setSort] = useState<{ col: string; state: SortState }>({
    col: "name",
    state: "ascending",
  });

  const cycleSort = (col: string) =>
    setSort((prev) => {
      if (prev.col !== col) return { col, state: "ascending" };
      const next: SortState =
        prev.state === "none"
          ? "ascending"
          : prev.state === "ascending"
          ? "descending"
          : "none";
      return { col, state: next };
    });

  const sortState = (col: string): SortState =>
    sort.col === col ? sort.state : "none";

  const sorted = [...ROWS].sort((a, b) => {
    if (sort.state === "none") return 0;
    const dir = sort.state === "ascending" ? 1 : -1;
    const aVal = a[sort.col as keyof typeof a];
    const bVal = b[sort.col as keyof typeof b];
    return aVal < bVal ? -dir : aVal > bVal ? dir : 0;
  });

  return (
    <div role="table" className="overflow-auto rounded-200 border border-[#e0e4e9]">
      <div role="rowgroup">
        <TableHeaderRow>
          <TableHeaderCell className="w-[60px] shrink-0">#</TableHeaderCell>
          <TableHeaderCell
            className="flex-1"
            sortable
            sort={sortState("name")}
            onSort={() => cycleSort("name")}
          >
            Nome
          </TableHeaderCell>
          <TableHeaderCell
            className="w-[120px] shrink-0"
            sortable
            sort={sortState("status")}
            onSort={() => cycleSort("status")}
          >
            Status
          </TableHeaderCell>
          <TableHeaderCell
            className="w-[120px] shrink-0"
            sortable
            sort={sortState("value")}
            onSort={() => cycleSort("value")}
          >
            Valor
          </TableHeaderCell>
        </TableHeaderRow>
      </div>
      <div role="rowgroup">
        {sorted.map((row) => (
          <TableRow key={row.id}>
            <TableRowCell className="w-[60px] shrink-0">{row.id}</TableRowCell>
            <TableRowCell className="flex-1">{row.name}</TableRowCell>
            <TableRowCell className="w-[120px] shrink-0">{row.status}</TableRowCell>
            <TableRowCell className="w-[120px] shrink-0" alignment="right">{row.value}</TableRowCell>
          </TableRow>
        ))}
      </div>
    </div>
  );
}

export const WithSortableHeaders: StoryObj = {
  render: () => <SortableTableDemo />,
};

export const HeaderCellSortStates: StoryObj = {
  render: () => (
    <div role="table" className="rounded-200 border border-[#e0e4e9] overflow-hidden">
      <div role="rowgroup">
        <TableHeaderRow>
          <TableHeaderCell className="w-[160px]" sortable sort="none">Sem ordenação</TableHeaderCell>
          <TableHeaderCell className="w-[160px]" sortable sort="ascending">Crescente</TableHeaderCell>
          <TableHeaderCell className="w-[160px]" sortable sort="descending">Decrescente</TableHeaderCell>
          <TableHeaderCell className="w-[160px]">Não ordenável</TableHeaderCell>
        </TableHeaderRow>
      </div>
    </div>
  ),
};
