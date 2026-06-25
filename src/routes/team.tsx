import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Lock, MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { WorkspaceShell } from "@/features/shell/WorkspaceShell";
import { Card, SectionTitle } from "@/features/shared/primitives";
import { useLanguage } from "@/features/shared/PreferencesControls";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/team")({
  head: () => ({ meta: [{ title: "Team — Postics" }] }),
  component: Page,
});

type Role = "owner" | "admin" | "editor" | "reviewer" | "viewer" | "client_viewer";
type Status = "active" | "invited";
type OrgType = "direct" | "agency";

type Member = {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: Role;
  status: Status;
  lastActive: string; // mono relative
};

type Invite = { id: string; email: string; role: Role; sentAgo: string };

const ROLE_ORDER: Role[] = ["owner", "admin", "editor", "reviewer", "viewer", "client_viewer"];

const ROLE_COPY: Record<"en" | "ru", Record<Role, string>> = {
  en: {
    owner: "Owner",
    admin: "Admin",
    editor: "Editor",
    reviewer: "Reviewer",
    viewer: "Viewer",
    client_viewer: "Client viewer",
  },
  ru: {
    owner: "Владелец",
    admin: "Админ",
    editor: "Редактор",
    reviewer: "Ревьюер",
    viewer: "Наблюдатель",
    client_viewer: "Клиент-просмотр",
  },
};

type CopyShape = {
  eyebrow: string;
  title: string;
  sub: string;
  invite: string;
  orgLabel: string;
  orgType: { direct: string; agency: string };
  orgNote: string;
  orgToggleHint: string;
  members: string;
  colMember: string;
  colRole: string;
  colLast: string;
  colStatus: string;
  statusActive: string;
  statusInvited: string;
  ownerLocked: string;
  reviewerHelp: string;
  clientViewerTag: string;
  matrixTitle: string;
  matrixSub: string;
  matrixCaption: string;
  humanFootnote: string;
  whiteLabelFootnote: string;
  pendingTitle: string;
  pendingEmpty: string;
  resend: string;
  revoke: string;
  changeRole: string;
  remove: string;
  sentAgo: (d: string) => string;
  dialogTitle: string;
  dialogSub: string;
  fieldEmail: string;
  fieldRole: string;
  fieldNote: string;
  cancel: string;
  send: string;
  invalidEmail: string;
  toastSent: (e: string) => string;
  toastResent: (e: string) => string;
  toastRevoked: (e: string) => string;
  toastRole: (n: string, r: string) => string;
  toastRemoved: (n: string) => string;
  caps: {
    teamBilling: string;
    connect: string;
    strategy: string;
    generate: string;
    approve: string;
    review: string;
    view: string;
    clientScope: string;
  };
};

const COPY: Record<"en" | "ru", CopyShape> = {
  en: {
    eyebrow: "Workspace",
    title: "Team",
    sub: "Invite teammates and set what each person can do.",
    invite: "Invite member",
    orgLabel: "Org",
    orgType: { direct: "Direct", agency: "Agency" },
    orgNote: "Agency orgs additionally get client_viewer.",
    orgToggleHint: "Switch demo org type",
    members: "Members",
    colMember: "Member",
    colRole: "Role",
    colLast: "Last active",
    colStatus: "Status",
    statusActive: "Active",
    statusInvited: "Invited",
    ownerLocked: "Owner — transfer in settings",
    reviewerHelp: "Reviewer = human review — an Advanced/Premium add-on (AI-only auto quality-gate is the default).",
    clientViewerTag: "Agency · M3",
    matrixTitle: "Role permissions",
    matrixSub: "What each role can do. Exact permissions finalize with backend roles.",
    matrixCaption: "Exact permissions finalize with backend roles.",
    humanFootnote: "Human review is an Advanced/Premium add-on; AI-only auto quality-gate is the default.",
    whiteLabelFootnote: "White-label client access — Agency orgs, M3.",
    pendingTitle: "Pending invites",
    pendingEmpty: "No pending invites.",
    resend: "Resend invite",
    revoke: "Revoke",
    changeRole: "Change role",
    remove: "Remove",
    sentAgo: (d: string) => `Invited ${d}`,
    dialogTitle: "Invite member",
    dialogSub: "Invite sends an email; the person joins your org with the role you pick.",
    fieldEmail: "Email",
    fieldRole: "Role",
    fieldNote: "Note (optional)",
    cancel: "Cancel",
    send: "Send invite",
    invalidEmail: "Enter a valid email.",
    toastSent: (e: string) => `Invite sent to ${e}.`,
    toastResent: (e: string) => `Invite resent to ${e}.`,
    toastRevoked: (e: string) => `Invite to ${e} revoked.`,
    toastRole: (n: string, r: string) => `${n} is now ${r}.`,
    toastRemoved: (n: string) => `${n} removed.`,
    caps: {
      teamBilling: "Manage team & billing",
      connect: "Connect site / settings",
      strategy: "Edit strategy & plan",
      generate: "Generate & edit content",
      approve: "Approve & publish/export",
      review: "Review queue / human review",
      view: "View dashboards & outcomes",
      clientScope: "client_viewer = read-only, scoped to assigned projects",
    },
  },
  ru: {
    eyebrow: "Воркспейс",
    title: "Команда",
    sub: "Пригласите коллег и задайте, что каждый может делать.",
    invite: "Пригласить",
    orgLabel: "Орг",
    orgType: { direct: "Direct", agency: "Agency" },
    orgNote: "Агентские орги дополнительно получают client_viewer.",
    orgToggleHint: "Сменить тип демо-орга",
    members: "Участники",
    colMember: "Участник",
    colRole: "Роль",
    colLast: "Был активен",
    colStatus: "Статус",
    statusActive: "Активен",
    statusInvited: "Приглашён",
    ownerLocked: "Владелец — передача в настройках",
    reviewerHelp: "Reviewer = ручная проверка — это Advanced/Premium-опция (по умолчанию работает AI-only с авто-quality-gate).",
    clientViewerTag: "Agency · M3",
    matrixTitle: "Матрица ролей",
    matrixSub: "Что доступно каждой роли. Окончательные правила фиксируются бэкендом.",
    matrixCaption: "Окончательные правила фиксируются бэкендом.",
    humanFootnote: "Ручная проверка — Advanced/Premium-опция; по умолчанию работает AI-only авто-quality-gate.",
    whiteLabelFootnote: "White-label клиентский доступ — для агентских оргов, M3.",
    pendingTitle: "Ожидают принятия",
    pendingEmpty: "Приглашений в ожидании нет.",
    resend: "Отправить ещё раз",
    revoke: "Отозвать",
    changeRole: "Сменить роль",
    remove: "Удалить",
    sentAgo: (d: string) => `Приглашён ${d}`,
    dialogTitle: "Пригласить участника",
    dialogSub: "Приглашение придёт на email; человек войдёт в ваш орг с выбранной ролью.",
    fieldEmail: "Email",
    fieldRole: "Роль",
    fieldNote: "Заметка (необязательно)",
    cancel: "Отмена",
    send: "Отправить",
    invalidEmail: "Введите корректный email.",
    toastSent: (e: string) => `Приглашение отправлено: ${e}.`,
    toastResent: (e: string) => `Приглашение повторно отправлено: ${e}.`,
    toastRevoked: (e: string) => `Приглашение отозвано: ${e}.`,
    toastRole: (n: string, r: string) => `${n} теперь ${r}.`,
    toastRemoved: (n: string) => `${n} удалён.`,
    caps: {
      teamBilling: "Команда и биллинг",
      connect: "Подключение сайта / настройки",
      strategy: "Редактировать стратегию и план",
      generate: "Генерация и правки контента",
      approve: "Аппрув и публикация/экспорт",
      review: "Очередь ручной проверки",
      view: "Дашборды и результаты",
      clientScope: "client_viewer — только чтение, в рамках назначенных проектов",
    },
  },
};

const SEED_MEMBERS: Member[] = [
  { id: "m-owner", name: "Elena Voss", initials: "EV", email: "elena@northboundcoffee.com", role: "owner", status: "active", lastActive: "now" },
  { id: "m-admin", name: "Marco Pellegrini", initials: "MP", email: "marco@northboundcoffee.com", role: "admin", status: "active", lastActive: "12m ago" },
  { id: "m-editor", name: "Hana Brooks", initials: "HB", email: "hana@northboundcoffee.com", role: "editor", status: "active", lastActive: "3h ago" },
  { id: "m-reviewer", name: "Rafael Ortiz", initials: "RO", email: "rafael@northboundcoffee.com", role: "reviewer", status: "active", lastActive: "1d ago" },
  { id: "m-viewer", name: "Leo Tanaka", initials: "LT", email: "leo@northboundcoffee.com", role: "viewer", status: "invited", lastActive: "—" },
];

const SEED_INVITES: Invite[] = [
  { id: "i-1", email: "amelia@northboundcoffee.com", role: "editor", sentAgo: "1d ago" },
  { id: "i-2", email: "tom@northboundcoffee.com", role: "viewer", sentAgo: "3d ago" },
];

const MATRIX: { key: keyof (typeof COPY)["en"]["caps"]; allow: Role[]; foot?: "review" | "white" }[] = [
  { key: "teamBilling", allow: ["owner", "admin"] },
  { key: "connect", allow: ["owner", "admin"] },
  { key: "strategy", allow: ["owner", "admin", "editor"] },
  { key: "generate", allow: ["owner", "admin", "editor"] },
  { key: "approve", allow: ["owner", "admin", "editor"] }, // reviewer = review-only
  { key: "review", allow: ["owner", "admin", "reviewer"], foot: "review" },
  { key: "view", allow: ["owner", "admin", "editor", "reviewer", "viewer", "client_viewer"] },
  { key: "clientScope", allow: ["client_viewer"], foot: "white" },
];

function Page() {
  const [lang] = useLanguage();
  const L = (lang === "ru" ? COPY.ru : COPY.en);
  const R = ROLE_COPY[lang === "ru" ? "ru" : "en"];
  const [orgType, setOrgType] = useState<OrgType>("direct");
  const [members, setMembers] = useState<Member[]>(SEED_MEMBERS);
  const [invites, setInvites] = useState<Invite[]>(SEED_INVITES);
  const [dialogOpen, setDialogOpen] = useState(false);

  const orgName = "Northbound Coffee Roasters";

  function changeRole(id: string, role: Role) {
    setMembers((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, role } : m));
      const m = next.find((x) => x.id === id);
      if (m) toast(L.toastRole(m.name, R[role]));
      return next;
    });
  }

  function removeMember(id: string) {
    const m = members.find((x) => x.id === id);
    if (!m || m.role === "owner") return;
    setMembers((prev) => prev.filter((x) => x.id !== id));
    toast(L.toastRemoved(m.name));
  }

  function sendInvite(email: string, role: Role) {
    const inv: Invite = { id: `i-${Date.now()}`, email, role, sentAgo: "just now" };
    setInvites((prev) => [inv, ...prev]);
    toast(L.toastSent(email));
  }

  function resendInvite(id: string) {
    const inv = invites.find((x) => x.id === id);
    if (inv) toast(L.toastResent(inv.email));
  }

  function revokeInvite(id: string) {
    const inv = invites.find((x) => x.id === id);
    if (!inv) return;
    setInvites((prev) => prev.filter((x) => x.id !== id));
    toast(L.toastRevoked(inv.email));
  }

  return (
    <WorkspaceShell active="team" breadcrumb={[{ label: L.title, to: "/team" }]}>
      <div className="mx-auto w-full max-w-5xl space-y-8 px-6 py-8 sm:px-8">
        {/* HEADER */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionTitle eyebrow={L.eyebrow} title={L.title} hint={L.sub} />
          <button
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-ink-900 px-3.5 py-2 text-sm text-paper shadow-elev-sm hover:bg-ink-700"
          >
            <Plus className="size-3.5" strokeWidth={1.75} /> {L.invite}
          </button>
        </div>

        {/* ORG CONTEXT */}
        <Card className="flex flex-wrap items-center gap-3 px-4 py-3">
          <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {L.orgLabel}
          </span>
          <span className="font-mono-num text-sm text-ink-900">{orgName}</span>
          <button
            onClick={() => setOrgType((t) => (t === "direct" ? "agency" : "direct"))}
            title={L.orgToggleHint}
            className={cn(
              "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium transition",
              orgType === "direct"
                ? "bg-brand-100 text-brand-700"
                : "bg-[color:var(--accent-gold-soft)] text-[color:var(--accent-gold)]",
            )}
          >
            {L.orgType[orgType]}
          </button>
          <span className="text-xs text-muted-foreground">{L.orgNote}</span>
        </Card>

        {/* MEMBERS TABLE */}
        <section className="space-y-3">
          <h2 className="font-display text-sm font-medium text-ink-900">{L.members}</h2>
          <Card className="overflow-hidden hover-lift">
            <Table>
              <TableHeader>
                <TableRow className="bg-surface-sunken">
                  <TableHead className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {L.colMember}
                  </TableHead>
                  <TableHead className="w-[200px] text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {L.colRole}
                  </TableHead>
                  <TableHead className="w-[140px] text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {L.colLast}
                  </TableHead>
                  <TableHead className="w-[120px] text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {L.colStatus}
                  </TableHead>
                  <TableHead className="w-[40px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.id} className="border-line">
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-lg bg-brand-100 font-display text-sm text-brand-700">
                          {m.initials}
                        </span>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-ink-900">{m.name}</div>
                          <div className="font-mono-num truncate text-[11px] text-muted-foreground">
                            {m.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <RoleSelect
                        value={m.role}
                        onChange={(r) => changeRole(m.id, r)}
                        orgType={orgType}
                        labels={R}
                        helperReviewer={L.reviewerHelp}
                        ownerLockedLabel={L.ownerLocked}
                        clientTag={L.clientViewerTag}
                      />
                    </TableCell>
                    <TableCell className="font-mono-num text-xs text-muted-foreground">
                      {m.lastActive}
                    </TableCell>
                    <TableCell>
                      <StatusDot status={m.status} L={L} />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            aria-label="More"
                            className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-surface-sunken"
                          >
                            <MoreHorizontal className="size-4" strokeWidth={1.5} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem disabled>{L.changeRole}</DropdownMenuItem>
                          {m.status === "invited" && (
                            <DropdownMenuItem onClick={() => toast(L.toastResent(m.email))}>
                              {L.resend}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            disabled={m.role === "owner"}
                            onClick={() => removeMember(m.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            {L.remove}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </section>

        {/* PERMISSIONS MATRIX */}
        <section className="space-y-3">
          <SectionTitle eyebrow="Permissions" title={L.matrixTitle} hint={L.matrixSub} />
          <Card className="overflow-x-auto">
            <Table className="text-sm">
              <TableHeader>
                <TableRow className="bg-surface-sunken">
                  <TableHead className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Capability
                  </TableHead>
                  {ROLE_ORDER.map((r) => (
                    <TableHead
                      key={r}
                      className={cn(
                        "text-center text-[10px] uppercase tracking-[0.14em] text-muted-foreground",
                        r === "client_viewer" && orgType === "direct" && "opacity-50",
                      )}
                    >
                      {R[r]}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {MATRIX.map((row) => (
                  <TableRow key={row.key} className="border-line">
                    <TableCell className="text-ink-900">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span>{L.caps[row.key]}</span>
                        {row.foot === "review" && (
                          <span className="text-[10px] text-muted-foreground">·</span>
                        )}
                        {row.foot === "review" && (
                          <span className="text-[10px] text-muted-foreground">{L.humanFootnote}</span>
                        )}
                        {row.foot === "white" && (
                          <span className="text-[10px] text-muted-foreground">— {L.whiteLabelFootnote}</span>
                        )}
                      </div>
                    </TableCell>
                    {ROLE_ORDER.map((r) => {
                      const ok = row.allow.includes(r);
                      const dim = r === "client_viewer" && orgType === "direct";
                      return (
                        <TableCell
                          key={r}
                          className={cn(
                            "text-center font-mono-num text-sm",
                            ok ? "text-brand-700" : "text-muted-foreground",
                            dim && "opacity-40",
                          )}
                        >
                          {ok ? "✓" : "—"}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="border-t border-line bg-surface-sunken px-4 py-2 text-[11px] text-muted-foreground">
              {L.matrixCaption}
            </div>
          </Card>
        </section>

        {/* PENDING INVITES */}
        <section className="space-y-3">
          <h2 className="font-display text-sm font-medium text-ink-900">{L.pendingTitle}</h2>
          {invites.length === 0 ? (
            <Card className="px-4 py-6 text-center text-sm text-muted-foreground">
              {L.pendingEmpty}
            </Card>
          ) : (
            <Card className="divide-y divide-line overflow-hidden">
              {invites.map((inv) => (
                <div
                  key={inv.id}
                  className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm"
                >
                  <span className="font-mono-num text-ink-900">{inv.email}</span>
                  <span className="inline-flex items-center rounded-md bg-brand-100 px-2 py-0.5 text-[11px] font-medium text-brand-700">
                    {R[inv.role]}
                  </span>
                  <span className="font-mono-num text-[11px] text-muted-foreground">
                    {L.sentAgo(inv.sentAgo)}
                  </span>
                  <div className="ml-auto flex items-center gap-1.5">
                    <button
                      onClick={() => resendInvite(inv.id)}
                      className="rounded-md px-2 py-1 text-xs text-ink-700 hover:bg-surface-sunken"
                    >
                      {L.resend}
                    </button>
                    <button
                      onClick={() => revokeInvite(inv.id)}
                      className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-surface-sunken"
                    >
                      {L.revoke}
                    </button>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </section>
      </div>

      <InviteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        orgType={orgType}
        labels={R}
        L={L}
        onSend={(email, role) => {
          sendInvite(email, role);
          setDialogOpen(false);
        }}
      />
    </WorkspaceShell>
  );
}

function StatusDot({ status, L }: { status: Status; L: typeof COPY.en }) {
  const live = status === "active";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-full",
          live ? "bg-[color:var(--success)]" : "bg-[color:var(--accent-gold)]",
        )}
      />
      <span className={live ? "text-ink-900" : "text-[color:var(--accent-gold)]"}>
        {live ? L.statusActive : L.statusInvited}
      </span>
    </span>
  );
}

function RoleSelect({
  value,
  onChange,
  orgType,
  labels,
  helperReviewer,
  ownerLockedLabel,
  clientTag,
}: {
  value: Role;
  onChange: (r: Role) => void;
  orgType: OrgType;
  labels: Record<Role, string>;
  helperReviewer: string;
  ownerLockedLabel: string;
  clientTag: string;
}) {
  const isOwner = value === "owner";
  if (isOwner) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-sunken px-2 py-1 text-[11px] text-ink-700">
        <Lock className="size-3" strokeWidth={1.75} />
        <span className="font-medium">{labels.owner}</span>
        <span className="text-muted-foreground">· {ownerLockedLabel}</span>
      </div>
    );
  }
  return (
    <div className="space-y-1">
      <Select value={value} onValueChange={(v) => onChange(v as Role)}>
        <SelectTrigger className="h-8 w-[170px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROLE_ORDER.map((r) => {
            const disabled =
              r === "owner" || (r === "client_viewer" && orgType === "direct");
            return (
              <SelectItem key={r} value={r} disabled={disabled}>
                <div className="flex items-center gap-2">
                  <span>{labels[r]}</span>
                  {r === "client_viewer" && (
                    <span className="text-[10px] text-muted-foreground">{clientTag}</span>
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {value === "reviewer" && (
        <p className="max-w-[260px] text-[10px] leading-snug text-muted-foreground">
          {helperReviewer}
        </p>
      )}
    </div>
  );
}

function InviteDialog({
  open,
  onOpenChange,
  orgType,
  labels,
  L,
  onSend,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  orgType: OrgType;
  labels: Record<Role, string>;
  L: typeof COPY.en;
  onSend: (email: string, role: Role) => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("editor");
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState(false);

  const valid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) && email.trim().length <= 254,
    [email],
  );

  function submit() {
    setTouched(true);
    if (!valid) return;
    onSend(email.trim(), role);
    setEmail("");
    setNote("");
    setRole("editor");
    setTouched(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">{L.dialogTitle}</DialogTitle>
          <DialogDescription>{L.dialogSub}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field label={L.fieldEmail}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched(true)}
              maxLength={254}
              autoFocus
              placeholder="name@company.com"
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 font-mono-num text-sm outline-none placeholder:text-muted-foreground focus:border-ink-700/30"
            />
            {touched && !valid && (
              <p className="mt-1 text-[11px] text-destructive">{L.invalidEmail}</p>
            )}
          </Field>
          <Field label={L.fieldRole}>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger className="h-9 w-full text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_ORDER.map((r) => {
                  const disabled =
                    r === "owner" || (r === "client_viewer" && orgType === "direct");
                  return (
                    <SelectItem key={r} value={r} disabled={disabled}>
                      <div className="flex items-center gap-2">
                        <span>{labels[r]}</span>
                        {r === "client_viewer" && (
                          <span className="text-[10px] text-muted-foreground">
                            {L.clientViewerTag}
                          </span>
                        )}
                        {r === "owner" && (
                          <span className="text-[10px] text-muted-foreground">·</span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </Field>
          <Field label={L.fieldNote}>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              rows={2}
              className="w-full resize-none rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ink-700/30"
              placeholder="—"
            />
          </Field>
        </div>
        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-surface-sunken"
          >
            {L.cancel}
          </button>
          <button
            onClick={submit}
            disabled={!valid}
            className={cn(
              "rounded-lg px-3.5 py-2 text-sm shadow-elev-sm",
              valid
                ? "bg-ink-900 text-paper hover:bg-ink-700"
                : "cursor-not-allowed bg-surface-sunken text-muted-foreground",
            )}
          >
            {L.send}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
