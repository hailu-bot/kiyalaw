'use client';

import { updateMatterStatus } from '@/app/actions/matterActions';

export default function MatterStatusSelect({ matterId, currentStatus }: { matterId: string; currentStatus: string }) {
  return (
    <form action={async (formData: FormData) => {
      const status = formData.get('status') as string;
      await updateMatterStatus(matterId, status);
    }}>
      <input type="hidden" name="matterId" value={matterId} />
      <select name="status" defaultValue={currentStatus}
        onChange={(e) => e.target.form?.requestSubmit()}
        className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest border rounded-sm cursor-pointer outline-none ${
          currentStatus === 'Active' ? 'bg-[#d9f0d9] text-[#1a6b1a] border-green-200' :
          currentStatus === 'Pending' ? 'bg-[#fef3c7] text-[#92400e] border-amber-200' :
          'bg-[#e5e7eb] text-[#6b7280] border-gray-200'
        }`}>
        <option value="Active">Active</option>
        <option value="Pending">Pending</option>
        <option value="Closed">Closed</option>
      </select>
    </form>
  );
}