"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createContact } from "@/api/contacts";
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
import {
  Check,
  ChevronsUpDown,
  MapPin,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AddressDialog } from "@/components/AddressDialog";
import Header from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset } from "@/components/ui/sidebar";

const breadcrumbs = [
  { label: "Dashboard", href: "dashboard" },
  { label: "Danh bạ điện thoại", href: "contacts" },
  { label: "Thêm liên hệ mới" },
];

function CreateContactContent() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    rank_id: 0,
    position_id: 0,
    department_id: 0,
    location_id: 0,
    address: "",
    military_phone_no: "",
    civilian_phone_no: "",
    mobile_no: "",
  });
  const [displayNames, setDisplayNames] = useState<Record<string, string>>({
    rank_name: "",
    position_name: "",
    department_name: "",
    location_name: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [openSelect, setOpenSelect] = useState<string | null>(null);
  const { departments, locations, ranks, positions, loading, error } =
    useContact();

  type DisplayField =
    | "rank_name"
    | "position_name"
    | "department_name"
    | "location_name";

  const validateField = (field: keyof typeof formData, value: string) => {
    let error = "";

    if (field === "name" && !value.trim()) {
      error = "Tên quản lý là bắt buộc";
    } else if (field === "rank_id" && !value.trim()) {
      error = "Cấp bậc là bắt buộc";
    } else if (field === "mobile_no") {
      if (!value.trim()) {
        error = "Số điện thoại là bắt buộc";
      } else if (!/^[0-9]{10,11}$/.test(value)) {
        error = "Số điện thoại phải có 10-11 chữ số";
      }
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

  const handleChange = (
    field: keyof typeof formData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value.toString());
  };

  const handleSubmit = async () => {
    // Validate tất cả các trường
    const fields = Object.keys(formData) as Array<keyof typeof formData>;
    const isValid = fields.every((field) =>
      validateField(field, formData[field].toString())
    );

    if (!isValid) {
      toast.error("Vui lòng kiểm tra lại thông tin!", {
        style: {
          background: "red",
          color: "#fff",
        },
        duration: 3000,
      });
      return;
    }

    // console.log('In data:', formData)

    try {
      await createContact(formData);
      toast.success("Thêm liên hệ thành công!", {
        style: {
          background: "oklch(44.8% 0.119 151.328)",
          color: "#fff",
        },
        duration: 3000,
      });
      router.push("/contacts");
    } catch (error) {
      console.error("Lỗi khi gửi dữ liệu:", error);
      toast.error("Đã xảy ra lỗi khi gửi dữ liệu!", {
        style: {
          background: "red",
          color: "#fff",
        },
        duration: 3000,
      });
    }
  };

  if (loading) {
    return (
      <SidebarInset>
        <Header breadcrumbs={breadcrumbs} />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        </div>
      </SidebarInset>
    );
  }

  if (error) {
    return (
      <SidebarInset>
        <Header breadcrumbs={breadcrumbs} />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="flex flex-col items-center gap-4">
            <p className="text-destructive text-lg">{error}</p>
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
              <CardTitle className="text-xl">Thêm liên hệ mới</CardTitle>
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
                              className={cn(
                                "w-full justify-between",
                                errors[field] && "border-destructive"
                              )}
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
                            value={formData[field]}
                            onChange={(e) =>
                              handleChange(field, e.target.value)
                            }
                            className={cn(
                              "h-10 bg-white border-gray-300 focus:border-primary focus:ring-primary",
                              errors[field] && "border-destructive"
                            )}
                          />
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsAddressDialogOpen(true);
                            }}
                            className="h-10 w-10 border-gray-300 hover:bg-gray-50"
                          >
                            <MapPin className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Input
                          id={field}
                          placeholder={`Nhập ${label.toLowerCase()}...`}
                          value={formData[field]}
                          onChange={(e) => handleChange(field, e.target.value)}
                          className={cn(
                            "h-10 bg-white border-gray-300 focus:border-primary focus:ring-primary",
                            errors[field] && "border-destructive"
                          )}
                        />
                      )}
                      {errors[field] && (
                        <span className="text-sm text-destructive">
                          {errors[field]}
                        </span>
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
                  >
                    Lưu
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AddressDialog
        isOpen={isAddressDialogOpen}
        onClose={() => setIsAddressDialogOpen(false)}
        onSave={(address) => {
          handleChange("address", address);
        }}
      />
    </SidebarInset>
  );
}

export default function CreateContactPage() {
  return (
    <ContactProvider>
      <CreateContactContent />
    </ContactProvider>
  );
}
