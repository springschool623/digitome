"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarInset } from "@/components/ui/sidebar";
import Header from "@/components/PageHeader";
import { toast } from "sonner";
import { getContact, updateContact } from "@/api/contacts";
import { Loader2, ArrowLeft, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Contact } from "@/types/contact";
import React from "react";
import { useContact, ContactProvider } from "@/contexts/ContactContext";
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
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddressDialog } from "@/components/AddressDialog";

const breadcrumbs = [
  { label: "Dashboard", href: "dashboard" },
  { label: "Danh bạ điện thoại", href: "contacts" },
  { label: "Chỉnh sửa liên hệ" },
];

function EditContactContent({ id }: { id: string }) {
  const router = useRouter();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openSelect, setOpenSelect] = useState<string | null>(null);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const {
    departments,
    locations,
    ranks,
    positions,
    loading: contextLoading,
    error: contextError,
  } = useContact();
  const [displayNames, setDisplayNames] = useState<Record<string, string>>({
    rank_name: "",
    position_name: "",
    department_name: "",
    location_name: "",
  });

  type DisplayField =
    | "rank_name"
    | "position_name"
    | "department_name"
    | "location_name";

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const data = await getContact(parseInt(id));
        setContact(data);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin liên hệ:", error);
        toast.error("Không thể lấy thông tin liên hệ!");
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [id]);
  // ... existing code ...
  useEffect(() => {
    const fetchContact = async () => {
      try {
        const data = await getContact(parseInt(id));
        setContact(data);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin liên hệ:", error);
        toast.error("Không thể lấy thông tin liên hệ!");
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [id]);

  // Add new effect to update displayNames when contact is loaded
  useEffect(() => {
    if (contact) {
      const newDisplayNames: Record<string, string> = {};

      // Update rank name
      const rank = ranks.find((r) => r.id === contact.rank_id);
      if (rank) newDisplayNames.rank_name = rank.name;

      // Update position name
      const position = positions.find((p) => p.id === contact.position_id);
      if (position) newDisplayNames.position_name = position.name;

      // Update department name
      const department = departments.find(
        (d) => d.id === contact.department_id
      );
      if (department) newDisplayNames.department_name = department.name;

      // Update location name
      const location = locations.find((l) => l.id === contact.location_id);
      if (location) newDisplayNames.location_name = location.name;

      setDisplayNames(newDisplayNames);
    }
  }, [contact, ranks, positions, departments, locations]);
  // ... existing code ...
  const handleChange = (field: keyof Contact, value: string | number) => {
    if (contact) {
      setContact({ ...contact, [field]: value });
    }
  };

  const handleSubmit = async () => {
    if (!contact) return;

    // Kiểm tra giá trị bắt buộc
    if (!contact.name.trim() || !contact.rank_id) {
      toast.error("Tên quản lý và cấp bậc là bắt buộc!", {
        style: {
          background: "red",
          color: "#fff",
        },
        duration: 3000,
      });
      return;
    }

    // Kiểm tra định dạng số điện thoại
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(contact.mobile_no)) {
      toast.error(
        "Số điện thoại không hợp lệ! Vui lòng nhập số điện thoại 10-11 số.",
        {
          style: {
            background: "red",
            color: "#fff",
          },
          duration: 3000,
        }
      );
      return;
    }

    setSaving(true);
    try {
      await updateContact(contact.id, contact);
      toast.success("Cập nhật liên hệ thành công!", {
        style: {
          background: "oklch(44.8% 0.119 151.328)",
          color: "#fff",
        },
        duration: 3000,
      });
      router.push("/contacts");
    } catch (error) {
      console.error("Lỗi khi cập nhật liên hệ:", error);
      toast.error("Đã xảy ra lỗi khi cập nhật liên hệ!", {
        style: {
          background: "red",
          color: "#fff",
        },
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddressSave = (newAddress: string) => {
    if (contact) {
      setContact({ ...contact, address: newAddress });
    }
  };

  if (loading || contextLoading) {
    return (
      <SidebarInset>
        <Header breadcrumbs={breadcrumbs} />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">
              Đang tải thông tin liên hệ...
            </p>
          </div>
        </div>
      </SidebarInset>
    );
  }

  if (contextError) {
    return (
      <SidebarInset>
        <Header breadcrumbs={breadcrumbs} />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="flex flex-col items-center gap-4">
            <p className="text-destructive text-lg">{contextError}</p>
            <Button
              variant="outline"
              onClick={() => router.push("/contacts")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách
            </Button>
          </div>
        </div>
      </SidebarInset>
    );
  }

  if (!contact) {
    return (
      <SidebarInset>
        <Header breadcrumbs={breadcrumbs} />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="flex flex-col items-center gap-4">
            <p className="text-destructive text-lg">Không tìm thấy liên hệ</p>
            <Button
              variant="outline"
              onClick={() => router.push("/contacts")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách
            </Button>
          </div>
        </div>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset>
      <Header breadcrumbs={breadcrumbs} />
      <div className="h-full flex items-center gap-4 p-4 pt-0">
        <div className="max-w-2xl mx-auto w-full">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Thông tin liên hệ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(
                    [
                      ["name", "Tên quản lý", true, "input"],
                      ["rank_id", "Cấp bậc", true, "select"],
                      ["position_id", "Chức vụ", false, "select"],
                      ["department_id", "Phòng/Ban", false, "select"],
                      ["location_id", "Đơn vị", false, "select"],
                      ["military_phone_no", "Số quân sự", false, "input"],
                      ["civilian_phone_no", "Số dân sự", false, "input"],
                      ["mobile_no", "Số điện thoại", true, "input"],
                      ["address", "Địa chỉ", false, "address"],
                    ] as const
                  ).map(([field, label, required, type]) => (
                    <div key={field} className="flex flex-col gap-2">
                      <Label htmlFor={field}>
                        {label}
                        {required && (
                          <span className="text-destructive">*</span>
                        )}
                      </Label>
                      {type === "select" ? (
                        <Popover
                          open={openSelect === field}
                          onOpenChange={(isOpen) =>
                            setOpenSelect(isOpen ? field : null)
                          }
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openSelect === field}
                              className={cn("w-full justify-between")}
                            >
                              {displayNames[
                                `${field.split("_")[0]}_name` as DisplayField
                              ] || "Chọn..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Tìm kiếm..." />
                              <CommandEmpty>Không tìm thấy.</CommandEmpty>
                              <CommandGroup>
                                {(field === "department_id"
                                  ? departments
                                  : field === "location_id"
                                  ? locations
                                  : field === "rank_id"
                                  ? ranks
                                  : field === "position_id"
                                  ? positions
                                  : []
                                ).map((option) => (
                                  <CommandItem
                                    key={option.id}
                                    value={option.name}
                                    onSelect={(currentValue) => {
                                      const selectedOption = (
                                        field === "department_id"
                                          ? departments
                                          : field === "location_id"
                                          ? locations
                                          : field === "rank_id"
                                          ? ranks
                                          : field === "position_id"
                                          ? positions
                                          : []
                                      ).find(
                                        (item) => item.name === currentValue
                                      );

                                      if (selectedOption) {
                                        handleChange(field, selectedOption.id);
                                        setDisplayNames((prev) => ({
                                          ...prev,
                                          [`${field.split("_")[0]}_name`]:
                                            selectedOption.name,
                                        }));
                                      }
                                      setOpenSelect(null);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        displayNames[
                                          `${field.split("_")[0]}_name`
                                        ] === option.name
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
                      ) : type === "address" ? (
                        <div className="flex gap-2">
                          <Input
                            id={field}
                            placeholder={`Nhập ${label.toLowerCase()}...`}
                            value={contact?.[field]}
                            onChange={(e) =>
                              handleChange(field, e.target.value)
                            }
                            className={required ? "border-primary" : ""}
                          />
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => setIsAddressDialogOpen(true)}
                          >
                            <MapPin className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Input
                          id={field}
                          placeholder={`Nhập ${label.toLowerCase()}...`}
                          value={contact?.[field]}
                          onChange={(e) => handleChange(field, e.target.value)}
                          className={required ? "border-primary" : ""}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/contacts")}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại
                  </Button>
                  <Button
                    className="bg-green-700 text-white hover:bg-green-800 gap-2"
                    onClick={handleSubmit}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      "Lưu thay đổi"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {contact && (
        <AddressDialog
          isOpen={isAddressDialogOpen}
          onClose={() => setIsAddressDialogOpen(false)}
          onSave={handleAddressSave}
          initialAddress={contact.address}
        />
      )}
    </SidebarInset>
  );
}

export default function EditContactPage(unwrappedProps: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(unwrappedProps.params);

  return (
    <ContactProvider>
      <EditContactContent id={id} />
    </ContactProvider>
  );
}
