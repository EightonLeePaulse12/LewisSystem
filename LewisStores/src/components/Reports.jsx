// src/components/ReportsPage.jsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DownloadReport, DownloadOverdueReport } from "@/api/manage";

export default function ReportsPage() {
  const [salesStart, setSalesStart] = useState("");
  const [salesEnd, setSalesEnd] = useState("");
  const [salesFormat, setSalesFormat] = useState("csv");

  const [paymentsStart, setPaymentsStart] = useState("");
  const [paymentsEnd, setPaymentsEnd] = useState("");
  const [paymentsFormat, setPaymentsFormat] = useState("csv");

  const [overdueFormat, setOverdueFormat] = useState("csv");

  const handleDownload = async (type, start, end, format) => {
    try {
      await DownloadReport(type, start, end, format);
    } catch (error) {
      console.error(error);
      // Add toast or alert
    }
  };

  const handleOverdueDownload = async (format) => {
    try {
      await DownloadOverdueReport(format);
      console.log(format)
    } catch (error) {
      console.error(error);
      // Add toast or alert
    }
  };

  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-6 text-3xl font-bold">Generate Reports</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <div>
          <h2 className="mb-4 text-xl font-semibold">Sales Report</h2>
          <Label htmlFor="sales-start">Start Date</Label>
          <Input id="sales-start" type="date" value={salesStart} onChange={(e) => setSalesStart(e.target.value)} />
          <Label htmlFor="sales-end">End Date</Label>
          <Input id="sales-end" type="date" value={salesEnd} onChange={(e) => setSalesEnd(e.target.value)} />
          <Label htmlFor="sales-format">Format</Label>
          <Select value={salesFormat} onValueChange={setSalesFormat}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
            </SelectContent>
          </Select>
          <Button className="mt-4" onClick={() => handleDownload("sales", salesStart, salesEnd, salesFormat)}>
            Download
          </Button>
        </div>
        <div>
          <h2 className="mb-4 text-xl font-semibold">Payments Report</h2>
          <Label htmlFor="payments-start">Start Date</Label>
          <Input id="payments-start" type="date" value={paymentsStart} onChange={(e) => setPaymentsStart(e.target.value)} />
          <Label htmlFor="payments-end">End Date</Label>
          <Input id="payments-end" type="date" value={paymentsEnd} onChange={(e) => setPaymentsEnd(e.target.value)} />
          <Label htmlFor="payments-format">Format</Label>
          <Select value={paymentsFormat} onValueChange={setPaymentsFormat}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
            </SelectContent>
          </Select>
          <Button className="mt-4" onClick={() => handleDownload("payments", paymentsStart, paymentsEnd, paymentsFormat)}>
            Download
          </Button>
        </div>
        <div>
          <h2 className="mb-4 text-xl font-semibold">Overdue Report</h2>
          <Label htmlFor="overdue-format">Format</Label>
          <Select value={overdueFormat} onValueChange={setOverdueFormat}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
            </SelectContent>
          </Select>
          <Button className="mt-4" onClick={() => handleOverdueDownload(overdueFormat)}>
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}