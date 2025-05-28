"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { Check, X, MapPin, ArrowUpDown, MoreHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { updateContact, deleteContact } from "@/api/contacts";
import { Contact } from "@/types/contact";
import { AddressDialog } from "@/components/AddressDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type EditableCellProps = {
  value: string;
  row: { original: Contact };
  column: { id: string };
  onSave: (id: number, field: string, value: string) => Promise<void>;
  onUpdate: (updatedContact: Contact) => void;
  isEnabled: boolean;
  options?: {
    departments: Option[];
    locations: Option[];
    ranks: Option[];
    positions: Option[];
  };
};

type Option = {
  id: number;
  name: string;
};

var count = 0;

const EditableCell = ({
  value,
  row,
  column,
  onSave,
  onUpdate,
  isEnabled,
  options,
}: EditableCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [open, setOpen] = useState(false);

  // Debug log
  // console.log('EditableCell options:', options)

  const getOptions = (): Option[] => {
    if (!options) return [];
    switch (column.id) {
      case "department_name":
        return options.departments;
      case "location_name":
        return options.locations;
      case "rank_name":
        return options.ranks;
      case "position_name":
        return options.positions;
      default:
        return [];
    }
  };

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      const updatedContact = { ...row.original, [column.id]: editValue };
      await onSave(row.original.id, column.id, editValue);
      onUpdate(updatedContact);
      setIsEditing(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleAddressSave = async (newAddress: string) => {
    setEditValue(newAddress);
    setIsSaving(true);
    try {
      const updatedContact = { ...row.original, [column.id]: newAddress };
      await onSave(row.original.id, column.id, newAddress);
      onUpdate(updatedContact);
      setIsEditing(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isEnabled) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="p-2 truncate">{value}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-[300px] break-words">{value}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (isEditing) {
    if (column.id === "address") {
      return (
        <>
          <div className="flex items-center gap-2">
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="h-8"
              disabled={isSaving}
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0"
              onClick={() => setIsAddressDialogOpen(true)}
              disabled={isSaving}
            >
              <MapPin className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <X className="h-4 w-4 text-red-600" />
            </Button>
          </div>
          <AddressDialog
            isOpen={isAddressDialogOpen}
            onClose={() => setIsAddressDialogOpen(false)}
            onSave={handleAddressSave}
            initialAddress={editValue}
          />
        </>
      );
    }

    if (
      [
        "department_name",
        "location_name",
        "rank_name",
        "position_name",
      ].includes(column.id)
    ) {
      return (
        <div className="flex items-center gap-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-[200px] justify-between"
              >
                {editValue || "Chọn..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Tìm kiếm..." />
                <CommandEmpty>Không tìm thấy.</CommandEmpty>
                <CommandGroup>
                  {getOptions().map((option) => (
                    <CommandItem
                      key={option.id}
                      value={option.name}
                      onSelect={(currentValue) => {
                        setEditValue(currentValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          editValue === option.name
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {option.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Check className="h-4 w-4 text-green-600" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0"
            onClick={handleCancel}
            disabled={isSaving}
          >
            <X className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="h-8"
          disabled={isSaving}
        />
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 shrink-0"
          onClick={handleSave}
          disabled={isSaving}
        >
          <Check className="h-4 w-4 text-green-600" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 shrink-0"
          onClick={handleCancel}
          disabled={isSaving}
        >
          <X className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="cursor-pointer hover:bg-muted/50 p-2 rounded-md truncate"
            onClick={() => setIsEditing(true)}
          >
            {value}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-[300px] break-words">{value}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const DeleteDialog = ({
  isOpen,
  onClose,
  onConfirm,
  contactName,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  contactName: string;
}) => {
  // Cleanup pointer-events khi dialog đóng hoặc component unmount
  useEffect(() => {
    if (!isOpen) {
      document.body.style.pointerEvents = "";
    }
    return () => {
      document.body.style.pointerEvents = "";
    };
  }, [isOpen]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          document.body.style.pointerEvents = "";
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận xóa</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa liên hệ &ldquo;{contactName}&rdquo;? Hành
            động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ActionsCell = ({
  row,
  hasPermission,
  onDelete,
}: {
  row: { original: Contact };
  hasPermission: (permission: string) => boolean;
  onDelete: () => void;
}) => {
  const contact = row.original;
  const canEdit = hasPermission("EDIT_CONTACTS");
  const canDelete = hasPermission("DELETE_CONTACTS");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteContact(contact.id, "Xóa bởi người dùng");
      toast.success("Xóa liên hệ thành công!");
      setIsDeleteDialogOpen(false);
      onDelete(); // Gọi hàm refresh sau khi xóa thành công
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      toast.error("Có lỗi xảy ra khi xóa liên hệ");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Mở menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {canEdit && (
            <DropdownMenuItem asChild>
              <Link href={`/contacts/edit/${contact.id}`}>Chỉnh sửa</Link>
            </DropdownMenuItem>
          )}
          {canDelete && (
            <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
              Xóa
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {isDeleteDialogOpen && (
        <DeleteDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDelete}
          contactName={contact.manager || "Không có tên"}
        />
      )}
    </>
  );
};

export const contactColumns = (
  onUpdateContact: (updatedContact: Contact) => void,
  isInlineEditEnabled: boolean,
  hasPermission: (permission: string) => boolean,
  options: {
    departments: Option[];
    locations: Option[];
    ranks: Option[];
    positions: Option[];
  },
  onDelete: () => void
): ColumnDef<Contact>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "STT",
  },
  {
    accessorKey: "rank_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="uppercase"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Cấp bậc
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row, column }) => (
      <EditableCell
        value={row.getValue("rank_name")}
        row={row}
        column={column}
        onSave={async (id, field, value) => {
          const contact = row.original;
          const selectedOption = options.ranks.find((r) => r.name === value);
          if (selectedOption) {
            await updateContact(id, { ...contact, rank_id: selectedOption.id });
            toast.success("Cập nhật thành công!");
          }
        }}
        onUpdate={onUpdateContact}
        isEnabled={isInlineEditEnabled}
        options={options}
      />
    ),
  },
  {
    accessorKey: "position_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="uppercase"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Chức vụ
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row, column }) => (
      <EditableCell
        value={row.getValue("position_name")}
        row={row}
        column={column}
        onSave={async (id, field, value) => {
          const contact = row.original;
          const selectedOption = options.positions.find(
            (p) => p.name === value
          );
          if (selectedOption) {
            await updateContact(id, {
              ...contact,
              position_id: selectedOption.id,
            });
            toast.success("Cập nhật thành công!");
          }
        }}
        onUpdate={onUpdateContact}
        isEnabled={isInlineEditEnabled}
        options={options}
      />
    ),
  },

  {
    accessorKey: "manager",
    header: "Họ tên",
    cell: ({ row, column }) => (
      <EditableCell
        value={row.getValue(column.id)}
        row={row}
        column={column}
        onSave={async (id, field, value) => {
          const contact = row.original;
          await updateContact(id, { ...contact, [field]: value });
          toast.success("Cập nhật thành công!");
        }}
        onUpdate={onUpdateContact}
        isEnabled={isInlineEditEnabled}
      />
    ),
  },
  {
    accessorKey: "department_name",
    header: "Phòng/Ban",
    cell: ({ row, column }) => (
      <EditableCell
        value={row.getValue("department_name")}
        row={row}
        column={column}
        onSave={async (id, field, value) => {
          const contact = row.original;
          const selectedOption = options.departments.find(
            (d) => d.name === value
          );
          if (selectedOption) {
            await updateContact(id, {
              ...contact,
              department_id: selectedOption.id,
            });
            toast.success("Cập nhật thành công!");
          }
        }}
        onUpdate={onUpdateContact}
        isEnabled={isInlineEditEnabled}
        options={options}
      />
    ),
  },
  {
    accessorKey: "location_name",
    header: "Đơn vị",
    cell: ({ row, column }) => (
      <EditableCell
        value={row.getValue("location_name")}
        row={row}
        column={column}
        onSave={async (id, value) => {
          const contact = row.original;
          const selectedOption = options.locations.find(
            (l) => l.name === value
          );
          if (selectedOption) {
            await updateContact(id, {
              ...contact,
              location_id: selectedOption.id,
            });
            toast.success("Cập nhật thành công!");
          }
        }}
        onUpdate={onUpdateContact}
        isEnabled={isInlineEditEnabled}
        options={options}
      />
    ),
  },
  {
    accessorKey: "address",
    header: "Địa chỉ",
    cell: ({ row, column }) => (
      <div className="max-w-[200px]">
        <EditableCell
          value={row.getValue(column.id)}
          row={row}
          column={column}
          onSave={async (id, field, value) => {
            const contact = row.original;
            await updateContact(id, { ...contact, [field]: value });
            toast.success("Cập nhật thành công!");
          }}
          onUpdate={onUpdateContact}
          isEnabled={isInlineEditEnabled}
        />
      </div>
    ),
  },
  {
    accessorKey: "military_postal_code",
    header: "Mã BĐQS",
    cell: ({ row, column }) => (
      <EditableCell
        value={row.getValue(column.id)}
        row={row}
        column={column}
        onSave={async (id, field, value) => {
          const contact = row.original;
          await updateContact(id, { ...contact, [field]: value });
          toast.success("Cập nhật thành công!");
        }}
        onUpdate={onUpdateContact}
        isEnabled={isInlineEditEnabled}
      />
    ),
  },
  {
    accessorKey: "mobile_no",
    header: "Số điện thoại",
    cell: ({ row, column }) => (
      <EditableCell
        value={row.getValue(column.id)}
        row={row}
        column={column}
        onSave={async (id, field, value) => {
          const contact = row.original;
          await updateContact(id, { ...contact, [field]: value });
          toast.success("Cập nhật thành công!");
        }}
        onUpdate={onUpdateContact}
        isEnabled={isInlineEditEnabled}
      />
    ),
  },
  {
    id: "actions",
    header: "Hành động",
    cell: ({ row }) => (
      <ActionsCell
        row={row}
        hasPermission={hasPermission}
        onDelete={onDelete}
      />
    ),
  },
];
