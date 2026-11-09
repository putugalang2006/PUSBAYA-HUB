"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Save, UserCog } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { TEMPEKAN_LIST } from "@/lib/constants";
import type { Tempekan } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Admin-only panel that lets every tempekan's penggerak (person in charge) be
 * renamed at any time. Values are saved to the shared settings store, with the
 * local cache kept in sync so the change is instant.
 */
export function TempekanPenggerakEditor() {
  const { tempekanPenggerak, updateTempekanPenggerak } = useApp();

  return (
    <section
      className="panel animate-fade-up p-5 sm:p-6"
      style={{ animationDelay: "240ms" }}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-bold text-white">
            Penanggung Jawab Tempekan
          </h3>
          <p className="mt-0.5 text-[11.5px] text-slate-400">
            Nama penggerak yang tampil di bawah tiap tempekan. Bisa diubah
            kapanpun oleh admin.
          </p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-slate-400">
          <UserCog className="h-5 w-5" />
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {TEMPEKAN_LIST.map((tempekan) => (
          <TempekanPenggerakRow
            key={tempekan}
            tempekan={tempekan}
            value={tempekanPenggerak[tempekan] ?? ""}
            onSave={(nama) => updateTempekanPenggerak(tempekan, nama)}
          />
        ))}
      </div>
    </section>
  );
}

function TempekanPenggerakRow({
  tempekan,
  value,
  onSave,
}: {
  tempekan: Tempekan;
  value: string;
  onSave: (nama: string) => Promise<boolean>;
}) {
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const dirty = draft.trim() !== value.trim();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving || !dirty) return;
    setSaving(true);
    const ok = await onSave(draft);
    setSaving(false);
    if (ok) {
      setJustSaved(true);
      window.setTimeout(() => setJustSaved(false), 1800);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 transition-colors hover:border-amber-400/20 hover:bg-amber-400/[0.03]"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11.5px] font-semibold leading-tight text-slate-300">
          {tempekan}
        </p>
        {justSaved && (
          <span className="inline-flex shrink-0 items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
            <Check className="h-3 w-3" />
            Tersimpan
          </span>
        )}
      </div>

      <div className="mt-2.5 flex items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Nama penggerak (opsional)"
          maxLength={60}
          className="field py-2 text-xs"
          aria-label={`Nama penggerak ${tempekan}`}
        />
        <button
          type="submit"
          disabled={saving || !dirty}
          className={cn(
            "btn btn-gold btn-sm shrink-0 px-3",
            (saving || !dirty) && "opacity-60",
          )}
          aria-label={`Simpan penggerak ${tempekan}`}
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          Simpan
        </button>
      </div>
    </form>
  );
}
