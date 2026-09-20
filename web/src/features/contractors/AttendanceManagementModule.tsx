import { useTranslation } from "react-i18next";
import React, { useState, useMemo } from "react";
import { MagicCard } from "@/components/ui/magic-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarCheck,
  UserCheck,
  UserX,
  Clock,
  AlertOctagon,
  Search,
  Download,
  Filter,
  ChevronRight,
  Fingerprint,
  LogIn,
  LogOut,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ScanLine,
  Users,
  CalendarDays,
  ShieldCheck,
  FileText,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { NumberTicker } from "@/components/ui/number-ticker";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CONTRACTORS = [
  { id: "all", name: "All Contractors" },
  { id: "C-8921", name: "Balaji Mining Services" },
  { id: "C-7734", name: "TechDrill Corp" },
  { id: "C-9102", name: "Apex Haulage" },
];

const attendanceTrend7d = [
  { day: "Mon", scheduled: 400, present: 380, absent: 20 },
  { day: "Tue", scheduled: 400, present: 395, absent: 5 },
  { day: "Wed", scheduled: 400, present: 350, absent: 50 },
  { day: "Thu", scheduled: 400, present: 400, absent: 0 },
  { day: "Fri", scheduled: 400, present: 390, absent: 10 },
  { day: "Sat", scheduled: 300, present: 295, absent: 5 },
  { day: "Sun", scheduled: 150, present: 142, absent: 8 },
];

const shifts = [
  {
    id: "A",
    label: "Shift A",
    time: "06:00 – 14:00",
    supervisor: "Rajesh Mehta",
    scheduled: 145,
    present: 138,
    color: "#10b981",
  },
  {
    id: "B",
    label: "Shift B",
    time: "14:00 – 22:00",
    supervisor: "Vikram Singh",
    scheduled: 150,
    present: 140,
    color: "#3b82f6",
  },
  {
    id: "C",
    label: "Shift C",
    time: "22:00 – 06:00",
    supervisor: "Anil Kumar",
    scheduled: 105,
    present: 64,
    color: "#f59e0b",
  },
];

type WorkerStatus = "present" | "absent" | "leave" | "half-day";
type TrainingStatus = "valid" | "expired" | "expiring";
type LeaveStatus = "pending" | "approved" | "rejected";

interface RfidEvent {
  time: string;
  type: "in" | "out";
  gate: string;
  anomaly?: string;
}

interface Worker {
  id: string;
  name: string;
  initials: string;
  role: string;
  contractor: string;
  contractorId: string;
  status: WorkerStatus;
  checkIn: string | null;
  checkOut: string | null;
  attendance30d: number;
  training: TrainingStatus;
  esi: string;
  shift: string;
  rfidEvents: RfidEvent[];
  calendarDays: ("present" | "absent" | "leave" | "off" | "late")[];
  nightShiftFlag?: boolean;
}

const mockWorkers: Worker[] = [
  {
    id: "W-001",
    name: "Ramesh Kumar",
    initials: "RK",
    role: "HEMM Operator",
    contractor: "Balaji Mining Services",
    contractorId: "C-8921",
    status: "present",
    checkIn: "06:12 AM",
    checkOut: null,
    attendance30d: 92,
    training: "valid",
    esi: "ESI-889012",
    shift: "A",
    rfidEvents: [
      { time: "06:12 AM", type: "in", gate: "Gate 1" },
      { time: "10:30 AM", type: "out", gate: "Gate 2", anomaly: "Mid-shift exit" },
      { time: "11:15 AM", type: "in", gate: "Gate 1" },
    ],
    calendarDays: Array.from({ length: 30 }, (_, i) =>
      i % 7 === 6 ? "off" : i === 4 || i === 17 ? "absent" : i === 10 ? "late" : "present"
    ),
  },
  {
    id: "W-002",
    name: "Suresh Singh",
    initials: "SS",
    role: "Blaster",
    contractor: "TechDrill Corp",
    contractorId: "C-7734",
    status: "absent",
    checkIn: null,
    checkOut: null,
    attendance30d: 78,
    training: "expired",
    esi: "ESI-112345",
    shift: "B",
    rfidEvents: [],
    calendarDays: Array.from({ length: 30 }, (_, i) =>
      i % 7 === 6 ? "off" : i % 5 === 0 ? "absent" : "present"
    ),
  },
  {
    id: "W-003",
    name: "Amit Patel",
    initials: "AP",
    role: "General Labor",
    contractor: "Balaji Mining Services",
    contractorId: "C-8921",
    status: "present",
    checkIn: "06:05 AM",
    checkOut: null,
    attendance30d: 98,
    training: "valid",
    esi: "ESI-445678",
    shift: "A",
    rfidEvents: [{ time: "06:05 AM", type: "in", gate: "Gate 1" }],
    calendarDays: Array.from({ length: 30 }, (_, i) =>
      i % 7 === 6 ? "off" : "present"
    ),
  },
  {
    id: "W-004",
    name: "Priya Sharma",
    initials: "PS",
    role: "Safety Supervisor",
    contractor: "Apex Haulage",
    contractorId: "C-9102",
    status: "leave",
    checkIn: null,
    checkOut: null,
    attendance30d: 85,
    training: "valid",
    esi: "ESI-667890",
    shift: "A",
    rfidEvents: [],
    calendarDays: Array.from({ length: 30 }, (_, i) =>
      i % 7 === 6 ? "off" : i >= 27 ? "leave" : i === 9 ? "late" : "present"
    ),
  },
  {
    id: "W-005",
    name: "Deepak Yadav",
    initials: "DY",
    role: "Truck Driver",
    contractor: "Apex Haulage",
    contractorId: "C-9102",
    status: "half-day",
    checkIn: "06:20 AM",
    checkOut: "12:10 PM",
    attendance30d: 82,
    training: "expiring",
    esi: "ESI-334521",
    shift: "A",
    rfidEvents: [
      { time: "06:20 AM", type: "in", gate: "Gate 1" },
      { time: "12:10 PM", type: "out", gate: "Gate 1" },
    ],
    calendarDays: Array.from({ length: 30 }, (_, i) =>
      i % 7 === 6 ? "off" : i % 8 === 0 ? "absent" : i % 12 === 0 ? "late" : "present"
    ),
  },
  {
    id: "W-006",
    name: "Mohan Das",
    initials: "MD",
    role: "Excavator Operator",
    contractor: "TechDrill Corp",
    contractorId: "C-7734",
    status: "present",
    checkIn: "22:15 PM",
    checkOut: null,
    attendance30d: 95,
    training: "valid",
    esi: "ESI-998877",
    shift: "C",
    nightShiftFlag: true,
    rfidEvents: [{ time: "22:15 PM", type: "in", gate: "Gate 3" }],
    calendarDays: Array.from({ length: 30 }, (_, i) => "present"),
  },
  {
    id: "W-007",
    name: "Ravi Teja",
    initials: "RT",
    role: "Electrician",
    contractor: "TechDrill Corp",
    contractorId: "C-7734",
    status: "present",
    checkIn: "05:58 AM",
    checkOut: null,
    attendance30d: 96,
    training: "valid",
    esi: "ESI-778901",
    shift: "C",
    rfidEvents: [
      { time: "05:58 AM", type: "in", gate: "Gate 2" },
    ],
    calendarDays: Array.from({ length: 30 }, (_, i) =>
      i % 7 === 6 ? "off" : i === 14 ? "absent" : "present"
    ),
  },
];

const leaveRequests = [
  {
    id: "LR-001",
    worker: "Priya Sharma",
    workerId: "W-004",
    type: "sick",
    dates: "Sep 18 – Sep 20",
    status: "approved" as LeaveStatus,
    reason: "Medical certificate submitted",
  },
  {
    id: "LR-002",
    worker: "Suresh Singh",
    workerId: "W-002",
    type: "unauthorized",
    dates: "Sep 18",
    status: "pending" as LeaveStatus,
    reason: "No prior notice",
  },
  {
    id: "LR-003",
    worker: "Deepak Yadav",
    workerId: "W-005",
    type: "casual",
    dates: "Sep 19",
    status: "pending" as LeaveStatus,
    reason: "Personal work",
  },
  {
    id: "LR-004",
    worker: "Ramesh Kumar",
    workerId: "W-001",
    type: "sick",
    dates: "Sep 5",
    status: "approved" as LeaveStatus,
    reason: "Fever",
  },
];

const rfidAnomalies = [
  {
    id: "A-001",
    worker: "Ramesh Kumar",
    workerId: "W-001",
    type: "mid_shift_exit",
    time: "10:30 AM",
    gate: "Gate 2",
    description: "Worker exited mine area mid-shift without authorization",
    resolved: false,
  },
  {
    id: "A-002",
    worker: "Suresh Singh",
    workerId: "W-002",
    type: "no_scan",
    time: "—",
    gate: "—",
    description: "Worker assigned to Shift B but no RFID scan recorded today",
    resolved: false,
  },
  {
    id: "A-003",
    worker: "Deepak Yadav",
    workerId: "W-005",
    type: "off_shift",
    time: "05:45 AM",
    gate: "Gate 1",
    description: "Worker scanned in 35 minutes before Shift A commencement",
    resolved: false,
  },
  {
    id: "A-004",
    worker: "Amit Patel",
    workerId: "W-003",
    type: "duplicate",
    time: "06:05 AM",
    gate: "Gate 1 & Gate 3",
    description: "Duplicate RFID scan detected at two gates within 3 seconds",
    resolved: true,
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const statusConfig: Record<
  WorkerStatus,
  { label: string; color: string; bg: string }
> = {
  present: { label: "Present", color: "text-emerald-400", bg: "bg-emerald-400/15 border-emerald-400/30" },
  absent: { label: "Absent", color: "text-red-400", bg: "bg-red-400/15 border-red-400/30" },
  leave: { label: "On Leave", color: "text-amber-400", bg: "bg-amber-400/15 border-amber-400/30" },
  "half-day": { label: "Half Day", color: "text-sky-400", bg: "bg-sky-400/15 border-sky-400/30" },
};

const leaveTypeConfig: Record<string, { label: string; color: string }> = {
  sick: { label: "Sick Leave", color: "text-blue-400" },
  casual: { label: "Casual Leave", color: "text-amber-400" },
  unauthorized: { label: "Unauthorized", color: "text-red-400" },
};

const leaveStatusConfig: Record<LeaveStatus, { label: string; badge: string }> = {
  pending: { label: "Pending", badge: "bg-amber-400/15 text-amber-400 border-amber-400/30" },
  approved: { label: "Approved", badge: "bg-emerald-400/15 text-emerald-400 border-emerald-400/30" },
  rejected: { label: "Rejected", badge: "bg-red-400/15 text-red-400 border-red-400/30" },
};

const anomalyTypeConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  mid_shift_exit: { label: "Mid-Shift Exit", icon: <LogOut className="h-4 w-4 text-orange-400" /> },
  no_scan: { label: "No Scan", icon: <ScanLine className="h-4 w-4 text-red-400" /> },
  off_shift: { label: "Off-Shift Scan", icon: <Clock className="h-4 w-4 text-amber-400" /> },
  duplicate: { label: "Duplicate Scan", icon: <RefreshCw className="h-4 w-4 text-purple-400" /> },
};

const DAY_COLORS = {
  present: "bg-emerald-500",
  absent: "bg-red-500",
  leave: "bg-amber-400",
  late: "bg-orange-400",
  off: "bg-muted",
};

// Worker history drawer
function WorkerHistoryDrawer({
  worker,
  open,
  onClose,
}: {
  worker: Worker | null;
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  if (!worker) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-background/80 backdrop-blur-2xl border-border/50 shadow-2xl">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-3 text-foreground">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-lg font-bold text-emerald-400 shadow-inner">
              {worker.initials}
            </div>
            <div className="text-left">
              <div className="font-bold text-xl">{worker.name}</div>
              <div className="text-sm text-muted-foreground font-normal flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-mono">{worker.id}</Badge> 
                <span>{worker.role}</span>
              </div>
            </div>
          </SheetTitle>
        </SheetHeader>

        {/* 30-day Calendar Heatmap */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            {t("30_day_attendance_heatmap", "30-Day Attendance Heatmap")}
          </h3>
          <div className="grid grid-cols-10 gap-1.5">
            {worker.calendarDays.map((day, i) => (
              <div
                key={i}
                className={`w-6 h-6 rounded-sm ${DAY_COLORS[day]} transition-transform hover:scale-110`}
                title={`Day ${i + 1}: ${day}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
            {Object.entries(DAY_COLORS).map(([k, v]) => (
              <span key={k} className="flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded-sm ${v}`} />
                <span className="capitalize">{k}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-lg p-3 border border-border">
            <div className="text-xs text-muted-foreground mb-1">{t("30d_attendance", "30D Attendance")}</div>
            <div className="text-2xl font-black text-emerald-400">{worker.attendance30d}%</div>
            <Progress value={worker.attendance30d} className="h-1.5 mt-2" />
          </div>
          <div className="bg-muted/50 rounded-lg p-3 border border-border">
            <div className="text-xs text-muted-foreground mb-1">{t("training_status", "Training Status")}</div>
            <div className={`text-sm font-semibold mt-2 flex items-center gap-1.5 ${worker.training === "valid" ? "text-emerald-400" : worker.training === "expiring" ? "text-amber-400" : "text-red-400"}`}>
              {worker.training === "valid" ? <ShieldCheck className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              <span className="capitalize">{worker.training}</span>
            </div>
          </div>
        </div>

        {/* Raw RFID Scan Log */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Fingerprint className="h-4 w-4" />
            {t("biometric_rfid_scan_log", "Biometric / RFID Scan Log — Today")}
          </h3>
          {worker.rfidEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <ScanLine className="h-8 w-8 mx-auto mb-2 opacity-30" />
              {t("no_rfid_events", "No RFID scan events recorded today")}
            </div>
          ) : (
            <div className="space-y-3">
              {worker.rfidEvents.map((event, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${event.anomaly ? "border-orange-400/30 bg-orange-400/5" : "border-border bg-muted/30"}`}
                >
                  <div className={`p-2 rounded-full ${event.type === "in" ? "bg-emerald-400/15" : "bg-red-400/15"}`}>
                    {event.type === "in" ? (
                      <LogIn className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <LogOut className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-foreground">
                      {event.time} — {event.gate}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {event.type === "in" ? "Entry" : "Exit"} scan
                    </div>
                    {event.anomaly && (
                      <div className="text-xs text-orange-400 mt-0.5 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> {event.anomaly}
                      </div>
                    )}
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">
                    #{String(i + 1).padStart(3, "0")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <Button variant="outline" className="w-full" onClick={() => {
            const csvContent = `data:text/csv;charset=utf-8,Time,Type,Gate,Anomaly\n${worker.rfidEvents.map(e => `${e.time},${e.type},${e.gate},${e.anomaly || ""}`).join("\n")}`;
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `rfid_log_${worker.id}_${new Date().toISOString().split("T")[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}>
            <Download className="h-4 w-4 mr-2" />
            {t("export_rfid_log_csv", "Export RFID Log as CSV")}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Shift donut ring
function ShiftRing({ shift }: { shift: typeof shifts[number] }) {
  const { t } = useTranslation();
  const pct = Math.round((shift.present / shift.scheduled) * 100);
  const absent = shift.scheduled - shift.present;
  const data = [
    { value: shift.present },
    { value: absent },
  ];

  return (
    <MagicCard className="shadow-lg border-border/50 hover:-translate-y-1 transition-transform duration-300">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3 border-b border-border/50 pb-3">
          <div>
            <div className="font-bold text-foreground text-lg">{shift.label}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Clock className="h-3 w-3" /> {shift.time}</div>
          </div>
          <Badge
            variant="outline"
            className={`text-xs px-2 py-1 ${pct >= 90 ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : pct >= 75 ? "bg-amber-500/10 border-amber-500/30 text-amber-500" : "bg-rose-500/10 border-rose-500/30 text-rose-500"}`}
          >
            {pct}% Attended
          </Badge>
        </div>

        <div className="flex items-center gap-5">
          <div className="relative w-24 h-24 flex-shrink-0 drop-shadow-md">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={28}
                  outerRadius={42}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  strokeWidth={0}
                >
                  <Cell fill={shift.color} />
                  <Cell fill="#1e293b" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-black text-foreground">{pct}%</span>
            </div>
          </div>
          <div className="flex-1 space-y-2.5">
            <div className="flex justify-between items-center text-sm bg-muted/30 px-2 py-1.5 rounded-md">
              <span className="text-muted-foreground">{t("present", "Present")}</span>
              <span className="font-semibold text-emerald-400">{shift.present}</span>
            </div>
            <div className="flex justify-between items-center text-sm bg-muted/30 px-2 py-1.5 rounded-md">
              <span className="text-muted-foreground">{t("absent", "Absent")}</span>
              <span className="font-semibold text-red-400">{absent}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("supervisor", "Supervisor")}</span>
              <span className="font-semibold text-foreground text-xs">{shift.supervisor}</span>
            </div>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          className="w-full mt-4 bg-muted hover:bg-muted/80 text-foreground"
        >
          {t("mark_bulk_absent", "Bulk Mark Absent")}
        </Button>
      </CardContent>
    </MagicCard>
  );
}

// ─── Main Module ─────────────────────────────────────────────────────────────

export function AttendanceManagementModule() {
  const { t } = useTranslation();
  const [contractorFilter, setContractorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [leaveStates, setLeaveStates] = useState<Record<string, LeaveStatus>>(
    Object.fromEntries(leaveRequests.map((l) => [l.id, l.status]))
  );
  const [resolvedAnomalies, setResolvedAnomalies] = useState<Set<string>>(
    new Set(rfidAnomalies.filter((a) => a.resolved).map((a) => a.id))
  );

  // Derived KPIs
  const totalPresent = mockWorkers.filter((w) => w.status === "present" || w.status === "half-day").length;
  const totalAbsent = mockWorkers.filter((w) => w.status === "absent").length;
  const totalLeave = mockWorkers.filter((w) => w.status === "leave").length;
  const totalAnomalies = rfidAnomalies.filter((a) => !resolvedAnomalies.has(a.id)).length;

  // Filtered workers
  const filteredWorkers = useMemo(() => {
    return mockWorkers.filter((w) => {
      const matchContractor = contractorFilter === "all" || w.contractorId === contractorFilter;
      const matchStatus = statusFilter === "all" || w.status === statusFilter;
      const matchSearch =
        search === "" ||
        w.name.toLowerCase().includes(search.toLowerCase()) ||
        w.id.toLowerCase().includes(search.toLowerCase()) ||
        w.esi.toLowerCase().includes(search.toLowerCase());
      return matchContractor && matchStatus && matchSearch;
    });
  }, [contractorFilter, statusFilter, search]);

  // CSV export for full attendance
  const exportAttendanceCSV = () => {
    const rows = [
      ["ID", "Name", "Role", "Contractor", "Status", "Check-In", "Check-Out", "Attendance 30D"],
      ...filteredWorkers.map((w) => [
        w.id, w.name, w.role, w.contractor, w.status, w.checkIn ?? "—", w.checkOut ?? "—", `${w.attendance30d}%`,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance_report_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const kpis = [
    {
      title: t("present_today", "Present Today"),
      value: totalPresent,
      total: mockWorkers.length,
      icon: <UserCheck className="h-5 w-5 text-emerald-400" />,
      color: "bg-emerald-400",
      textColor: "text-emerald-400",
      pulse: false,
    },
    {
      title: t("absent_today", "Absent Today"),
      value: totalAbsent,
      total: mockWorkers.length,
      icon: <UserX className="h-5 w-5 text-red-400" />,
      color: "bg-red-400",
      textColor: "text-red-400",
      pulse: false,
    },
    {
      title: t("on_approved_leave", "On Approved Leave"),
      value: totalLeave,
      total: mockWorkers.length,
      icon: <CalendarCheck className="h-5 w-5 text-amber-400" />,
      color: "bg-amber-400",
      textColor: "text-amber-400",
      pulse: false,
    },
    {
      title: t("rfid_anomalies", "RFID Anomalies"),
      value: totalAnomalies,
      total: rfidAnomalies.length,
      icon: <AlertOctagon className="h-5 w-5 text-orange-400" />,
      color: "bg-orange-400",
      textColor: "text-orange-400",
      pulse: totalAnomalies > 0,
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/50 min-h-screen text-foreground w-full space-y-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-xl text-foreground shadow-lg border border-border">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-emerald-400">
            <CalendarCheck className="h-8 w-8 text-emerald-400" />
            {t("attendance_worker_management", "Attendance & Worker Management")}
          </h1>
          <p className="text-muted-foreground/60 mt-1 text-white">
            {t(
              "realtime_rfid_attendance_shift_management",
              "Real-time RFID attendance tracking, shift-wise headcounts, DGMS compliance monitoring, and biometric event logs."
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={contractorFilter} onValueChange={setContractorFilter}>
            <SelectTrigger className="bg-transparent border-slate-600 text-slate-200 w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONTRACTORS.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={exportAttendanceCSV}
            className="bg-emerald-600 hover:bg-emerald-500 text-white border-0"
          >
            <Download className="h-4 w-4 mr-2" />
            {t("export_csv", "Export CSV")}
          </Button>
        </div>
      </div>

      {/* ── Section 1: KPI Ribbon ───────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => {
          const pct = Math.round((kpi.value / kpi.total) * 100);
          return (
            <Card key={i} className="shadow-sm hover:shadow-md transition-shadow border-border bg-background">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-muted-foreground">{kpi.title}</span>
                    <div className="relative">
                      {kpi.pulse && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-400" />
                        </span>
                      )}
                        {kpi.icon}
                    </div>
                  </div>
                  <div className={`text-4xl font-black ${kpi.textColor}`}>
                    <NumberTicker value={kpi.value} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    of {kpi.total} total workers
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full mt-4 overflow-hidden">
                    <div
                    className={`h-full ${kpi.color} transition-all duration-1000 rounded-full`}
                    style={{ width: `${pct}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
          );
        })}
      </div>

      {/* ── Section 2: 7-Day Trend Chart ────────────────────── */}
      <MagicCard className="shadow-lg border-border/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
            {t("7_day_attendance_trend", "7-Day Attendance Trend")}
          </CardTitle>
          <Badge variant="outline" className="text-xs border-amber-400/30 text-amber-400">
            DGMS Min: 75%
          </Badge>
        </CardHeader>
        <CardContent className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attendanceTrend7d} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
              <RechartsTooltip
                contentStyle={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", borderRadius: 8 }}
                labelStyle={{ color: "var(--foreground)" }}
              />
              <Legend />
              <ReferenceLine
                y={300}
                stroke="#f59e0b"
                strokeDasharray="6 3"
                strokeWidth={2}
                label={{ value: "75% Min", fill: "#f59e0b", fontSize: 11, position: "right" }}
              />
              <Bar dataKey="scheduled" fill="#334155" name="Scheduled" radius={[4, 4, 0, 0]} />
              <Bar dataKey="present" fill="#10b981" name="Present" radius={[4, 4, 0, 0]} />
              <Bar dataKey="absent" fill="#f43f5e" name="Absent" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </MagicCard>

      {/* ── Section 3: Shift Breakdown ───────────────────────── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      >
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {t("shift_wise_breakdown", "Shift-wise Headcount Breakdown")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shifts.map((shift) => (
            <ShiftRing key={shift.id} shift={shift} />
          ))}
        </div>
      </motion.div>

      {/* ── Sections 4–6: Tabbed ─────────────────────────────── */}
      <Tabs defaultValue="workers" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-lg mb-4 bg-card/60 backdrop-blur-sm border border-border/50 rounded-full p-1 h-12 shadow-inner">
          <TabsTrigger value="workers" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full data-[state=active]:shadow-md transition-all">
            <Users className="h-4 w-4 mr-2" />
            {t("worker_directory", "Worker Directory")}
          </TabsTrigger>
          <TabsTrigger value="leave" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full data-[state=active]:shadow-md transition-all">
            <CalendarCheck className="h-4 w-4 mr-2" />
            {t("leave_log", "Leave Log")}
          </TabsTrigger>
          <TabsTrigger value="anomalies" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full data-[state=active]:shadow-md transition-all relative">
            <AlertOctagon className="h-4 w-4 mr-2" />
            {t("rfid_anomalies_tab", "RFID Anomalies")}
            {totalAnomalies > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold shadow-sm animate-bounce">
                {totalAnomalies}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 4: Worker Directory ─────────────────────────── */}
        <TabsContent value="workers">
          <MagicCard className="shadow-lg border-border/50 overflow-hidden">
            <CardHeader className="pb-0">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                  <Input
                    placeholder={t("search_workers_esi", "Search by name, ID or ESI...")}
                    className="pl-9 bg-muted/50 border-transparent focus-visible:ring-emerald-500"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder={t("status", "Status")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("all_statuses", "All Statuses")}</SelectItem>
                    <SelectItem value="present">{t("present", "Present")}</SelectItem>
                    <SelectItem value="absent">{t("absent", "Absent")}</SelectItem>
                    <SelectItem value="leave">{t("on_leave", "On Leave")}</SelectItem>
                    <SelectItem value="half-day">{t("half_day", "Half Day")}</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {filteredWorkers.length} {t("workers", "workers")}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 mt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-6 py-4 font-semibold">{t("worker", "Worker")}</th>
                      <th className="px-6 py-4 font-semibold">{t("contractor", "Contractor")}</th>
                      <th className="px-6 py-4 font-semibold">{t("shift", "Shift")}</th>
                      <th className="px-6 py-4 font-semibold">{t("status", "Status")}</th>
                      <th className="px-6 py-4 font-semibold">{t("check_in", "Check-In")}</th>
                      <th className="px-6 py-4 font-semibold">{t("check_out", "Check-Out")}</th>
                      <th className="px-6 py-4 font-semibold">{t("attendance_30d", "30D Att.")}</th>
                      <th className="px-6 py-4 text-right font-semibold">{t("actions", "Actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-background">
                    {filteredWorkers.map((worker) => {
                      const sc = statusConfig[worker.status];
                      return (
                        <tr key={worker.id} className="hover:bg-muted/30 transition-colors">
                          {/* Worker */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-emerald-500 flex-shrink-0">
                                {worker.initials}
                              </div>
                              <div>
                                <div className="font-semibold text-foreground flex items-center gap-2">
                                  {worker.name}
                                  {worker.nightShiftFlag && (
                                    <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20 text-[9px] uppercase px-1.5 py-0">
                                      🔴 Limit Exceeded
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">{worker.id}</div>
                                <div className="text-xs text-muted-foreground font-mono">{worker.esi}</div>
                              </div>
                            </div>
                          </td>
                          {/* Contractor */}
                          <td className="px-6 py-4">
                            <Badge variant="secondary" className="font-normal text-xs">{worker.contractor}</Badge>
                            <div className="text-xs text-muted-foreground mt-1">{worker.role}</div>
                          </td>
                          {/* Shift */}
                          <td className="px-6 py-4">
                            <div className="font-semibold">Shift {worker.shift}</div>
                          </td>
                          {/* Status */}
                          <td className="px-6 py-4">
                            <Badge variant="outline" className={`${sc.bg} ${sc.color} border`}>
                              {sc.label}
                            </Badge>
                          </td>
                          {/* Check-In */}
                          <td className="px-6 py-4">
                            {worker.checkIn ? (
                              <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-sm">
                                <LogIn className="h-3.5 w-3.5" />
                                {worker.checkIn}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          {/* Check-Out */}
                          <td className="px-6 py-4">
                            {worker.checkOut ? (
                              <div className="flex items-center gap-1.5 text-red-400 font-mono text-sm">
                                <LogOut className="h-3.5 w-3.5" />
                                {worker.checkOut}
                              </div>
                            ) : worker.checkIn ? (
                              <span className="text-amber-400 text-xs animate-pulse">Active</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          {/* Attendance */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${worker.attendance30d >= 90 ? "bg-emerald-400" : worker.attendance30d >= 75 ? "bg-amber-400" : "bg-red-400"}`}
                                  style={{ width: `${worker.attendance30d}%` }}
                                />
                              </div>
                              <span className="font-semibold text-xs">{worker.attendance30d}%</span>
                            </div>
                          </td>
                          {/* Actions */}
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10"
                              onClick={() => {
                                setSelectedWorker(worker);
                                setDrawerOpen(true);
                              }}
                            >
                              {t("view_history", "View History")}
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredWorkers.length === 0 && (
                  <div className="text-center py-16 text-muted-foreground">
                    <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">{t("no_workers_found", "No workers match your filters.")}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </MagicCard>
        </TabsContent>

        {/* ── Tab 5: Leave & Absence Log ──────────────────────── */}
        <TabsContent value="leave">
          <MagicCard className="shadow-lg border-border/50 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                {t("leave_absence_log", "Leave & Absence Log")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-6 py-4 font-semibold">{t("worker", "Worker")}</th>
                      <th className="px-6 py-4 font-semibold">{t("leave_type", "Leave Type")}</th>
                      <th className="px-6 py-4 font-semibold">{t("dates", "Date(s)")}</th>
                      <th className="px-6 py-4 font-semibold">{t("reason", "Reason")}</th>
                      <th className="px-6 py-4 font-semibold">{t("status", "Status")}</th>
                      <th className="px-6 py-4 text-right font-semibold">{t("actions", "Actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-background">
                    {leaveRequests.map((req) => {
                      const currentStatus = leaveStates[req.id];
                      const lsc = leaveStatusConfig[currentStatus];
                      const ltc = leaveTypeConfig[req.type];
                      return (
                        <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-foreground">{req.worker}</div>
                            <div className="text-xs text-muted-foreground font-mono">{req.workerId}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`font-semibold text-sm ${ltc.color}`}>{ltc.label}</span>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">{req.dates}</td>
                          <td className="px-6 py-4 text-muted-foreground text-xs max-w-[200px]">{req.reason}</td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className={`${lsc.badge} border`}>
                              {lsc.label}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {currentStatus === "pending" ? (
                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="sm"
                                  className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border-0"
                                  onClick={() => setLeaveStates((s) => ({ ...s, [req.id]: "approved" }))}
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                  {t("approve", "Approve")}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-400 hover:bg-red-400/10"
                                  onClick={() => setLeaveStates((s) => ({ ...s, [req.id]: "rejected" }))}
                                >
                                  <XCircle className="h-3.5 w-3.5 mr-1" />
                                  {t("reject", "Reject")}
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">{t("actioned", "Actioned")}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
                  </MagicCard>
                </TabsContent>
        
                {/* ── Tab 6: RFID Anomalies ───────────────────────────── */}
                <TabsContent value="anomalies">
                  <div className="space-y-3">
                    {rfidAnomalies.map((anomaly) => {
                      const isResolved = resolvedAnomalies.has(anomaly.id);
                      const atc = anomalyTypeConfig[anomaly.type];
                      return (
                        <motion.div
                          key={anomaly.id}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <MagicCard
                            className={`border shadow-sm transition-all duration-300 ${isResolved ? "opacity-60 border-border bg-card/40" : "border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10 hover:shadow-[0_4px_20px_-4px_rgba(249,115,22,0.15)]"}`}
                          >
                            <CardContent className="p-4 flex items-start gap-4">
                              <div className={`p-3 rounded-xl flex-shrink-0 border ${isResolved ? "bg-muted border-border" : "bg-orange-500/20 border-orange-500/30"}`}>
                                {atc.icon}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="font-bold text-foreground text-lg">{anomaly.worker}</span>
                                  <Badge variant="outline" className="text-xs font-mono">{anomaly.workerId}</Badge>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${isResolved ? "border-border text-muted-foreground" : "border-orange-500/40 text-orange-400 bg-orange-500/10"}`}
                                  >
                                    {atc.label}
                                  </Badge>
                                  {isResolved && (
                                    <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Resolved
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground/90">{anomaly.description}</p>
                                {anomaly.time !== "—" && (
                                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground font-medium">
                                    <span className="flex items-center gap-1.5 bg-background/50 px-2 py-1 rounded-md border border-border/50">
                                      <Clock className="h-3 w-3 text-primary" /> {anomaly.time}
                                    </span>
                                    <span className="flex items-center gap-1.5 bg-background/50 px-2 py-1 rounded-md border border-border/50">
                                      <ScanLine className="h-3 w-3 text-primary" /> {anomaly.gate}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {!isResolved && (
                                <Button
                                  size="sm"
                                  className="flex-shrink-0 bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 transition-all"
                                  onClick={() =>
                                    setResolvedAnomalies((prev) => new Set([...prev, anomaly.id]))
                                  }
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                                  {t("resolve", "Resolve")}
                                </Button>
                              )}
                            </CardContent>
                          </MagicCard>
                        </motion.div>
                      );
                    })}
            {rfidAnomalies.every((a) => resolvedAnomalies.has(a.id)) && (
              <div className="text-center py-16 text-muted-foreground">
                <ShieldCheck className="h-12 w-12 mx-auto mb-3 text-emerald-400 opacity-60" />
                <p className="font-semibold text-foreground">{t("all_anomalies_resolved", "All RFID anomalies resolved!")}</p>
                <p className="text-sm mt-1">{t("no_active_rfid_issues", "No active RFID scan issues detected.")}</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Worker History Drawer */}
      <WorkerHistoryDrawer
        worker={selectedWorker}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
