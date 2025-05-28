"use client";

import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import { ContactExcelRow } from "@/lib/ContactExcelRow";
import React from "react";
import { toast } from "sonner";
import { addContacts } from "@/api/contacts";
import { ContactImport } from "@/types/contact";

interface InputExcelProps {
  onImport: (data: ContactImport[]) => void;
}

export default function InputExcel({ onImport }: InputExcelProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        if (!workbook.SheetNames.length) {
          toast.error("Không tìm thấy sheet trong file Excel.", {
            style: {
              background: "red",
              color: "#fff",
            },
            duration: 3000,
          });
          return;
        }

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (!jsonData.length) {
          toast.error("Không có dữ liệu nào trong file Excel.", {
            style: {
              background: "red",
              color: "#fff",
            },
            duration: 3000,
          });
          return;
        }

        console.log(jsonData);

        const importedContacts: ContactImport[] = (
          jsonData as ContactExcelRow[]
        ).map((row) => ({
          rank_name: row.rank_name || row["Cấp bậc"] || "",
          position_name: row.position_name || row["Chức vụ"] || "",
          manager: row.manager || row["Họ tên"] || "",
          department_name: row.department_name || row["Phòng/Ban"] || "",
          location_name: row.location_name || row["Đơn vị"] || "",
          address: row.address || row["Địa chỉ"] || "",
          military_postal_code:
            row.military_postal_code || row["Mã BĐQS"] || "",
          mobile_no: row.mobile_no || row["Số điện thoại"] || "",
        }));

        // for (const contact of importedContacts) {
        //   console.log(contact);
        //   return;
        // }

        if (importedContacts.every((c) => !c.manager)) {
          toast.error("Không có liên hệ nào hợp lệ (thiếu Họ tên).", {
            style: {
              background: "red",
              color: "#fff",
            },
            duration: 3000,
          });
          return;
        }

        try {
          // Call API to import contacts
          const response = await addContacts(importedContacts);

          if (response.success) {
            onImport(importedContacts);
            // toast.success(
            //   `Nhập thành công ${importedContacts.length} liên hệ.`,
            //   {
            //     style: {
            //       background: "#28a745",
            //       color: "#fff",
            //     },
            //     duration: 3000,
            //   }
            // );
          }
        } catch (error) {
          console.error("Lỗi khi gọi API:", error);
          // toast.error("Đã xảy ra lỗi khi nhập liên hệ vào hệ thống.", {
          //   style: {
          //     background: "red",
          //     color: "#fff",
          //   },
          //   duration: 3000,
          // });
        } finally {
          // Reset input để lần sau chọn lại file vẫn nhận sự kiện
          if (inputRef.current) inputRef.current.value = "";
        }
      } catch (err) {
        console.error("Lỗi đọc file Excel:", err);
        toast.error(
          "Đã xảy ra lỗi khi đọc file. Vui lòng kiểm tra lại định dạng.",
          {
            style: {
              background: "red",
              color: "#fff",
            },
            duration: 3000,
          }
        );
        // Reset input nếu có lỗi đọc file
        if (inputRef.current) inputRef.current.value = "";
      }
    };

    reader.onerror = () => {
      toast.error("Không thể đọc file. Vui lòng thử lại.", {
        style: {
          background: "red",
          color: "#fff",
        },
        duration: 3000,
      });
      // Reset input nếu có lỗi đọc file
      if (inputRef.current) inputRef.current.value = "";
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="excel-upload">
        <Button variant="outline" asChild>
          <span>Import Excel</span>
        </Button>
      </label>
      <input
        ref={inputRef}
        id="excel-upload"
        type="file"
        accept=".xlsx, .xls"
        className="hidden"
        onChange={handleImportExcel}
      />
    </div>
  );
}
