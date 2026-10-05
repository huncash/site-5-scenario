import { SCHOOL_WATERMARK, isSchoolHost } from "@/lib/school";

export function SchoolWatermark() {
  if (typeof window === "undefined" || !isSchoolHost()) return null;
  return (
    <div className="school-watermark" aria-hidden>
      <div className="school-watermark-grid">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} className="school-watermark-mark">
            {SCHOOL_WATERMARK}
          </span>
        ))}
      </div>
    </div>
  );
}
