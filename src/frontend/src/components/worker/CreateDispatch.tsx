import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Zap } from "lucide-react";
import { useState } from "react";
import type { AuthUser } from "../../types";
import { MACHINE_TYPES } from "../../types";

interface Props {
  user: AuthUser;
  onSubmit: (data: {
    machineType: string;
    orderId: string;
    clientName: string;
  }) => void;
  onBack: () => void;
}

export default function CreateDispatch({ onSubmit, onBack }: Props) {
  const [machineType, setMachineType] = useState("");
  const [orderId, setOrderId] = useState("");
  const [clientName, setClientName] = useState("");
  const [error, setError] = useState("");

  const now = new Date();
  const previewId = `DISP-${now.toISOString().slice(0, 10)}-XXXX`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!machineType || !orderId.trim() || !clientName.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    onSubmit({
      machineType,
      orderId: orderId.trim(),
      clientName: clientName.trim(),
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-[430px] mx-auto">
      <header className="sticky top-0 z-10 bg-card/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          data-ocid="nav.button"
          onClick={onBack}
          aria-label="Go back"
          className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        </button>
        <h1 className="font-semibold text-foreground">Create New Dispatch</h1>
      </header>

      <main className="flex-1 p-4 space-y-5">
        <div className="card-inner p-4 flex items-center gap-3">
          <Zap
            className="w-8 h-8 text-primary flex-shrink-0"
            aria-hidden="true"
          />
          <div>
            <p className="text-xs text-muted-foreground">
              Auto-generated Dispatch ID
            </p>
            <p className="font-mono text-sm font-semibold text-primary">
              {previewId}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="machine-type"
              className="text-sm font-medium text-muted-foreground"
            >
              Machine Type
            </Label>
            <Select value={machineType} onValueChange={setMachineType}>
              <SelectTrigger
                id="machine-type"
                data-ocid="dispatch.select"
                className="bg-input border-border h-12 text-base"
              >
                <SelectValue placeholder="Select machine type…" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {MACHINE_TYPES.map((t) => (
                  <SelectItem
                    key={t}
                    value={t}
                    className="text-foreground hover:bg-accent"
                  >
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="order-id"
              className="text-sm font-medium text-muted-foreground"
            >
              Order ID
            </Label>
            <Input
              id="order-id"
              data-ocid="dispatch.input"
              placeholder="e.g. ORD-9245"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="bg-input border-border h-12 text-base"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="client-name"
              className="text-sm font-medium text-muted-foreground"
            >
              Client Name
            </Label>
            <Input
              id="client-name"
              data-ocid="dispatch.input"
              placeholder="e.g. Green Valley Farms"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="bg-input border-border h-12 text-base"
            />
          </div>

          {error && (
            <p
              data-ocid="dispatch.error_state"
              className="text-destructive text-sm"
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            data-ocid="dispatch.primary_button"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base"
            style={{ height: "52px" }}
          >
            Start Checklist →
          </Button>
        </form>
      </main>
    </div>
  );
}
