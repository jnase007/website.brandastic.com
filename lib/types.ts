export type StepBlock =
  | { type: "step"; text: string }
  | { type: "heading"; text: string }
  | { type: "note"; text: string };

export type ItemStatus = "not_started" | "sent" | "received" | "needs_changes";

export type CardType = "sent" | "form" | "file";

export type FormField =
  | { kind: "note"; text: string }
  | { kind: "text" | "email" | "url" | "textarea"; name: string; label: string; help?: string; required?: boolean }
  | { kind: "select"; name: string; label: string; options: string[]; required?: boolean }
  | { kind: "checkbox"; name: string; label: string }
  | { kind: "colors"; name: string; max: number; orName: string; orLabel: string }
  | { kind: "url-na"; name: string; label: string }
  | { kind: "repeat"; name: string; addLabel: string; min?: number; max?: number; fields: FormField[] }
  | { kind: "group"; presets?: Array<"A" | "B" | "C">; label?: string; fields: FormField[] };

export type FormSchema = { fields: FormField[] };

export type Answers = Record<string, unknown>;

export type ItemFile = { id: string; filename: string };

export type LibraryItem = {
  id: string;
  title: string;
  whatWeNeed: string;
  why: string;
  steps: StepBlock[];
  doneLooksLike: string;
  phase: 1 | 2 | 3;
  presets: Array<"A" | "B" | "C">;
  offByDefault: boolean;
  allowsResourceLink: boolean;
  sortOrder: number;
  cardType: CardType;
  formSchema: FormSchema | null;
  fileFolder: string | null;
};

export type ClientItem = {
  id: string;
  clientId: string;
  libraryItemId: string | null;
  anchor: string;
  title: string;
  whatWeNeed: string;
  why: string;
  steps: StepBlock[];
  doneLooksLike: string;
  phase: 1 | 2 | 3;
  sortOrder: number;
  allowsResourceLink: boolean;
  resourceUrl: string | null;
  status: ItemStatus;
  sentAt: string | null;
  note: string | null;
  cardType: CardType;
  formSchema: FormSchema | null;
  fileFolder: string | null;
  answers: Answers;
  files: ItemFile[];
};

export type ClientRecord = {
  id: string;
  name: string;
  slug: string;
  preset: "A" | "B" | "C";
  driveUrl: string | null;
  duePhase1: string | null;
  duePhase2: string | null;
  duePhase3: string | null;
  contentDocUrl: string | null;
  createdAt: string;
};

export type PageChoice = "in_doc" | "current_site";

export type ContentPage = {
  id: string;
  clientId: string;
  title: string;
  sortOrder: number;
  choice: PageChoice | null;
  status: ItemStatus;
  note: string | null;
};

export type ClientStats = ClientRecord & {
  total: number;
  received: number;
  waitingClient: number;
  waitingSandy: number;
  overduePhases: number[];
};
