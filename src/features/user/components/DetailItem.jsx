/*
|--------------------------------------------------------------------------
| DETAIL ITEM
|--------------------------------------------------------------------------
| Shared label/value row. `compact` gives the smaller inline variant used
| inside the "Current Consultation" summary blocks.
|--------------------------------------------------------------------------
*/

const DetailItem = ({ icon: Icon, label, value, compact }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-600">
        {Icon && (
          <Icon
            className="shrink-0 text-[18px] text-slate-400"
            aria-hidden="true"
          />
        )}

        <span className="text-slate-500">{label}:</span>

        <span className="font-semibold text-slate-800">
          {value}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <Icon
            className="shrink-0 text-[18px] text-slate-400"
            aria-hidden="true"
          />
        )}

        <span className="text-sm text-slate-500">
          {label}
        </span>
      </div>

      <span className="text-right text-sm font-semibold text-slate-800">
        {value}
      </span>
    </div>
  );
};

export default DetailItem;