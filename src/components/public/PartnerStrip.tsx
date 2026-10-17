import React from 'react';

// TODO: sambungkan ke Supabase tabel 'partners' (columns: id, name, logo_url, website_url, is_active)
interface PartnerItem {
  id: string;
  name: string;
  category: string;
}

const DUMMY_PARTNERS: PartnerItem[] = [
  { id: '1', name: 'Komite Sekolah Mandiri', category: 'Dewan Pengawas' },
  { id: '2', name: 'Pusat Kreativitas Remaja', category: 'Mitra Pembinaan' },
  { id: '3', name: 'Ikatan Alumni Berdaya', category: 'Jejaring Karir' },
  { id: '4', name: 'Ruang Literasi Digital', category: 'Teknologi' },
  { id: '5', name: 'Dinas Pemuda & Olahraga', category: 'Instansi Pembina' },
  { id: '6', name: 'Sinergi Komunitas Peduli', category: 'Sosial & Lingkungan' },
];

interface PartnerStripProps {
  partners?: PartnerItem[];
}

export const PartnerStrip: React.FC<PartnerStripProps> = ({
  partners = DUMMY_PARTNERS,
}) => {
  // Jika belum ada data mitra, sembunyikan section ini
  if (!partners || partners.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#F8FAFC] border-b border-[#E2E8F0] py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="shrink-0 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Mitra & pendukung:
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-6 sm:gap-10">
            {partners.map((partner) => (
              <div
                key={partner.id}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors cursor-default select-none group"
                title={`${partner.name} - ${partner.category}`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300 group-hover:bg-[#2563EB] transition-colors" />
                <span className="text-xs sm:text-sm font-semibold tracking-wide text-slate-500 group-hover:text-[#0F172A] transition-colors">
                  {partner.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
