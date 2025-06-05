"use client";

import { useEffect, useMemo, useState } from "react";
import { DataTable } from "./data-table";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Edit2, Check } from "lucide-react";
import Header from "@/components/PageHeader";
import FilterDialog from "@/components/FilterDialog";
import FilterRow from "@/components/FilterRow";
import { Input } from "@/components/ui/input";
import InputExcel from "@/components/InputExcel";
import { getContacts } from "@/api/contacts";
import { contactColumns } from "./columns";
import { Contact, ContactImport } from "@/types/contact";
import { usePermission } from "@/hooks/usePermission";
import { ContactProvider, useContact } from "@/contexts/ContactContext";
import { useRouter } from "next/navigation";

const breadcrumbs = [
  { label: "Dashboard", href: "dashboard" },
  { label: "Danh mục chính" },
  { label: "Danh sách quân sự" },
];

const filterFields = [
  "rank_id",
  "position_id",
  "department_id",
  "location_id",
] as const;

const initialFilters = {
  rank_id: 0,
  position_id: 0,
  department_id: 0,
  location_id: 0,
};

function ContactsContent() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isInlineEditEnabled, setIsInlineEditEnabled] = useState(false);
  const { hasPermission } = usePermission();
  const router = useRouter();
  const { ranks, positions, departments, locations } = useContact();
  // const [setPendingEdits] = useState<Record<number, Partial<Contact>>>({})

  const fetchContacts = async () => {
    try {
      const data = await getContacts();
      setContacts(data);
    } catch {
      console.error("Lỗi khi lấy danh bạ:");
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const updateState =
    <T extends object>(setter: React.Dispatch<React.SetStateAction<T>>) =>
    (field: keyof T, value: string | number) =>
      setter((prev) => ({ ...prev, [field]: value }));

  const handleFilterChange = updateState(setFilters);

  const handleUpdateContact = (updatedContact: Contact) => {
    setContacts((prev) =>
      prev.map((contact) =>
        contact.id === updatedContact.id ? updatedContact : contact
      )
    );
    // setPendingEdits((prev) => ({
    //   ...prev,
    //   [updatedContact.id]: {
    //     ...(prev[updatedContact.id] || {}),
    //     ...updatedContact,
    //   },
    // }))
  };

  // const handleSaveAll = async () => {
  //   const editIds = Object.keys(pendingEdits)
  //   if (editIds.length === 0) {
  //     toast.info('Không có thay đổi nào để lưu!')
  //     return
  //   }
  //   try {
  //     await Promise.all(
  //       editIds.map(async (id) => {
  //         const edit = pendingEdits[Number(id)]
  //         if (edit) {
  //           const original = contacts.find((c) => c.id === Number(id))
  //           if (original) {
  //             await updateContact(Number(id), {
  //               ...original,
  //               ...edit,
  //               id: Number(id),
  //             })
  //           }
  //         }
  //       })
  //     )
  //     toast.success('Đã lưu tất cả thay đổi!')
  //     setPendingEdits({})
  //     fetchContacts()
  //   } catch {
  //     toast.error('Có lỗi khi lưu thay đổi!')
  //   }
  // }

  const getFilteredContacts = useMemo(() => {
    return contacts
      .filter((c) =>
        [
          c.rank_id,
          c.position_id,
          c.name,
          c.department_id,
          c.location_id,
          c.military_phone_no,
          c.civilian_phone_no,
          c.address,
          c.mobile_no,
        ]
          .filter(Boolean)
          .some((val) =>
            val.toString().toLowerCase().includes(search.toLowerCase())
          )
      )
      .filter((c) =>
        filterFields.every(
          (field) => !filters[field] || filters[field] === c[field]
        )
      );
  }, [contacts, filters, search]);

  const validOptions = useMemo(() => {
    const filtered = contacts.filter((c) =>
      filterFields.every(
        (field) => !filters[field] || filters[field] === c[field]
      )
    );

    return {
      rank_id: ranks
        .filter((r) => filtered.some((c) => c.rank_id === r.id))
        .map((r) => r.name),
      position_id: positions
        .filter((p) => filtered.some((c) => c.position_id === p.id))
        .map((p) => p.name),
      department_id: departments
        .filter((d) => filtered.some((c) => c.department_id === d.id))
        .map((d) => d.name),
      location_id: locations
        .filter((l) => filtered.some((c) => c.location_id === l.id))
        .map((l) => l.name),
    };
  }, [contacts, filters, ranks, positions, departments, locations]);

  const filterRows = filterFields.map((field) => {
    const list =
      field === "rank_id"
        ? ranks
        : field === "position_id"
        ? positions
        : field === "department_id"
        ? departments
        : locations;

    return {
      label:
        field === "rank_id"
          ? "Cấp bậc:"
          : field === "position_id"
          ? "Chức vụ:"
          : field === "department_id"
          ? "Phòng/Ban:"
          : "Đơn vị:",
      value: list.find((item) => item.id === filters[field])?.name || "",
      onChange: (val: string) => {
        const id = list.find((item) => item.name === val)?.id || 0;
        handleFilterChange(field, id);
      },
      placeholder: `Lọc theo ${
        field === "rank_id"
          ? "cấp bậc"
          : field === "position_id"
          ? "chức vụ"
          : field === "department_id"
          ? "phòng/ban"
          : "đơn vị"
      }`,
      options: validOptions[field], // đây vẫn là string[]
    };
  });

  const resetFilters = () => {
    setSearch("");
    setFilters(initialFilters);
  };

  const columns = useMemo(
    () =>
      contactColumns(
        handleUpdateContact,
        isInlineEditEnabled,
        hasPermission,
        {
          ranks,
          positions,
          departments,
          locations,
        },
        fetchContacts
      ),
    [
      isInlineEditEnabled,
      hasPermission,
      ranks,
      positions,
      departments,
      locations,
    ]
  );

  const handleImportContacts = async (importedContacts: ContactImport[]) => {
    console.group("Contact Import Process");
    try {
      console.log("Starting import process...");
      console.log("Number of contacts to import:", importedContacts.length);
      console.log("Sample contact data:", importedContacts[0]);

      // Log validation results
      const invalidContacts = importedContacts.filter(
        (contact) => !contact.name
      );
      if (invalidContacts.length > 0) {
        console.warn("Found contacts without names:", invalidContacts);
      }

      // Log unique values for reference data
      const uniqueRanks = new Set(
        importedContacts.map((c) => c.rank_name).filter(Boolean)
      );
      const uniquePositions = new Set(
        importedContacts.map((c) => c.position_name).filter(Boolean)
      );
      const uniqueDepartments = new Set(
        importedContacts.map((c) => c.department_name).filter(Boolean)
      );
      const uniqueLocations = new Set(
        importedContacts.map((c) => c.location_name).filter(Boolean)
      );

      console.log("Unique reference data found in import:");
      console.log("- Ranks:", Array.from(uniqueRanks));
      console.log("- Positions:", Array.from(uniquePositions));
      console.log("- Departments:", Array.from(uniqueDepartments));
      console.log("- Locations:", Array.from(uniqueLocations));

      // Refresh contacts list
      console.log("Refreshing contacts list...");
      const startTime = performance.now();
      await fetchContacts();
      const endTime = performance.now();
      console.log(
        `Contacts list refreshed in ${(endTime - startTime).toFixed(2)}ms`
      );

      console.log("Import process completed successfully");
    } catch (error) {
      console.error("Error during import process:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
        });
      }
    } finally {
      console.groupEnd();
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <Header breadcrumbs={breadcrumbs} />
      <div className="flex items-center justify-between my-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <FilterDialog
            footer={
              <Button variant="outline" onClick={resetFilters}>
                Làm mới
                <RefreshCcw className="ml-2 h-4 w-4" />
              </Button>
            }
          >
            {filterRows.map((props) => (
              <FilterRow key={props.label} {...props} />
            ))}
          </FilterDialog>
          {hasPermission("EDIT_CONTACTS") && (
            <>
              <Button
                variant={isInlineEditEnabled ? "default" : "outline"}
                onClick={() => setIsInlineEditEnabled(!isInlineEditEnabled)}
                className={
                  isInlineEditEnabled
                    ? "bg-green-700 text-white hover:bg-green-800"
                    : ""
                }
              >
                {isInlineEditEnabled ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Inline Edit
                  </>
                ) : (
                  <>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Inline Edit
                  </>
                )}
              </Button>
              {/* {isInlineEditEnabled && (
                <Button
                  className="bg-blue-600 text-white hover:bg-blue-700 ml-2"
                  onClick={handleSaveAll}
                >
                  Lưu tất cả
                </Button>
              )} */}
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          {hasPermission("EDIT_CONTACTS") && (
            <Button
              variant="addButton"
              onClick={() => router.push("/contacts/create")}
            >
              Thêm mới
            </Button>
          )}
          {hasPermission("IMPORT_CONTACTS") && (
            <InputExcel onImport={handleImportContacts} />
          )}
        </div>
      </div>

      <DataTable columns={columns} data={getFilteredContacts} />
    </div>
  );
}
export default function ContactsPage() {
  return (
    <ContactProvider>
      <ContactsContent />
    </ContactProvider>
  );
}
