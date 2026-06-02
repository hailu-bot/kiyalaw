'use client';

import { useState } from 'react';
import { useToastStore } from '@/lib/store/useToastStore';
import { getRateCards, createRateCard, deleteRateCard } from '@/app/actions/rateActions';
import { Plus, Trash2, DollarSign } from 'lucide-react';

type RateCardRow = {
  id: string;
  userId: string;
  clientId: string | null;
  matterId: string | null;
  clientName: string | null;
  matterTitle: string | null;
  rate: number;
  label: string | null;
  effectiveFrom: string | null;
  effectiveTo: string | null;
};

type ClientOption = { id: string; name: string };
type MatterOption = { id: string; title: string };

export default function TabRateCards({
  clients,
  matters,
  initialCards,
}: {
  clients: ClientOption[];
  matters: MatterOption[];
  initialCards: RateCardRow[];
}) {
  const [cards, setCards] = useState<RateCardRow[]>(initialCards);
  const [showForm, setShowForm] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  const refresh = async () => {
    const data = await getRateCards();
    setCards(data);
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[20px] font-headline-sm text-[#0A1128] mb-1">Rate Cards</h2>
          <p className="text-[14px] text-[#46464d]">
            Set custom billing rates per client or matter. The most specific match wins.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0A1128] text-white text-[11px] font-bold uppercase tracking-wider hover:bg-[#162244] transition-colors cursor-pointer"
        >
          <Plus size={14} />
          {showForm ? 'Cancel' : 'Add Rate'}
        </button>
      </div>

      {showForm && (
        <form
          action={async (formData) => {
            const data = {
              clientId: String(formData.get('clientId') ?? '').trim() || undefined,
              matterId: String(formData.get('matterId') ?? '').trim() || undefined,
              rate: parseFloat(String(formData.get('rate') ?? '0')),
              label: String(formData.get('label') ?? '').trim() || undefined,
              effectiveFrom: String(formData.get('effectiveFrom') ?? '').trim() || undefined,
              effectiveTo: String(formData.get('effectiveTo') ?? '').trim() || undefined,
            };
            const result = await createRateCard(data);
            addToast(result.message, result.success ? 'success' : 'error');
            if (result.success) {
              await refresh();
              setShowForm(false);
            }
          }}
          className="bg-[#f8f9ff] border border-[#c6c6ce]/30 p-6 mb-6 space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-[#7c839f] mb-1">Rate ($/hr) *</label>
              <input name="rate" type="number" step="0.01" min="0" required className="w-full border border-[#c6c6ce]/50 py-2 px-3 text-[13px] font-body-md outline-none focus:border-[#D4AF37] transition-colors" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-[#7c839f] mb-1">Label</label>
              <input name="label" className="w-full border border-[#c6c6ce]/50 py-2 px-3 text-[13px] font-body-md outline-none focus:border-[#D4AF37] transition-colors" placeholder="e.g., Senior Partner Rate" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-[#7c839f] mb-1">Client (optional)</label>
              <select name="clientId" className="w-full border border-[#c6c6ce]/50 py-2 px-3 text-[13px] font-body-md outline-none focus:border-[#D4AF37]">
                <option value="">Firm-wide</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-[#7c839f] mb-1">Matter (optional)</label>
              <select name="matterId" className="w-full border border-[#c6c6ce]/50 py-2 px-3 text-[13px] font-body-md outline-none focus:border-[#D4AF37]">
                <option value="">Default</option>
                {matters.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-[#7c839f] mb-1">Effective From</label>
              <input name="effectiveFrom" type="date" className="w-full border border-[#c6c6ce]/50 py-2 px-3 text-[13px] font-body-md outline-none focus:border-[#D4AF37] transition-colors" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-[#7c839f] mb-1">Effective To</label>
              <input name="effectiveTo" type="date" className="w-full border border-[#c6c6ce]/50 py-2 px-3 text-[13px] font-body-md outline-none focus:border-[#D4AF37] transition-colors" />
            </div>
          </div>

          <button type="submit" className="bg-[#0A1128] text-white px-6 py-2.5 text-[12px] font-bold uppercase tracking-wider hover:bg-[#162244] transition-colors cursor-pointer">
            Save Rate Card
          </button>
        </form>
      )}

      <div className="space-y-2">
        {cards.length === 0 && (
          <p className="text-[#7c839f] text-[14px]">No rate cards yet. Add one to override the firm default rate.</p>
        )}
        {cards.map((card) => (
          <div key={card.id} className="flex items-center justify-between p-4 bg-white border border-[#c6c6ce]/30 hover:shadow-sm transition-shadow">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-[#D4AF37]" />
                <span className="text-[20px] font-bold text-[#0A1128]">${card.rate.toFixed(2)}/hr</span>
                {card.label && <span className="text-[12px] text-[#7c839f] ml-2">({card.label})</span>}
              </div>
              <div className="flex items-center gap-2 mt-1 text-[12px] text-[#46464d]">
                {card.clientName && <span className="px-2 py-0.5 bg-[#eff4ff] border border-[#c6c6ce]/30 text-[10px] font-bold uppercase tracking-wider">Client: {card.clientName}</span>}
                {card.matterTitle && <span className="px-2 py-0.5 bg-[#eff4ff] border border-[#c6c6ce]/30 text-[10px] font-bold uppercase tracking-wider">Matter: {card.matterTitle}</span>}
                {!card.clientName && !card.matterTitle && <span className="text-[#7c839f]">Firm-wide default override</span>}
              </div>
            </div>
            <form action={async () => {
              const result = await deleteRateCard(card.id);
              addToast(result.message, result.success ? 'success' : 'error');
              if (result.success) refresh();
            }}>
              <button type="submit" className="p-2 text-[#7c839f] hover:text-[#ba1a1a] transition-colors cursor-pointer">
                <Trash2 size={14} />
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
