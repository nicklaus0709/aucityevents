import type { Field } from '@/lib/admin-config';
import { toInputDateTime } from '@/lib/utils';

/** Renderiza un campo de formulario según su tipo (sin estado propio). */
export default function FieldInput({ field, value, idPrefix }: { field: Field; value: unknown; idPrefix: string }) {
  const id = `${idPrefix}-${field.name}`;
  const v = value ?? field.default ?? '';

  if (field.type === 'checkbox') {
    return (
      <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
        <input type="checkbox" name={field.name} defaultChecked={Boolean(value ?? field.default)} className="h-4 w-4 rounded" />
        {field.label}
      </label>
    );
  }

  let input: React.ReactNode;
  switch (field.type) {
    case 'textarea':
      input = <textarea id={id} name={field.name} defaultValue={String(v)} maxLength={field.max} rows={5} className="input" required={field.required} />;
      break;
    case 'lines':
      input = <textarea id={id} name={field.name} defaultValue={Array.isArray(value) ? value.join('\n') : ''} rows={6} className="input" />;
      break;
    case 'image':
      input = (
        <div className="space-y-2">
          {typeof value === 'string' && value && (
            <>
              <img src={value} alt="" className="h-24 rounded-lg object-cover" />
              <input type="hidden" name={`${field.name}__current`} value={value} />
            </>
          )}
          <input id={id} type="file" name={field.name} accept="image/jpeg,image/png,image/webp" className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-stone-100 file:px-3 file:py-2 file:text-sm file:font-semibold" required={field.required && !value} />
          <p className="text-xs text-stone-500">JPG, PNG o WebP · máx. 5 MB{value ? ' · dejá vacío para conservar la actual' : ''}</p>
        </div>
      );
      break;
    case 'datetime':
      input = <input id={id} type="datetime-local" name={field.name} defaultValue={toInputDateTime(value as string)} className="input" required={field.required} />;
      break;
    case 'date':
      input = <input id={id} type="date" name={field.name} defaultValue={String(v)} className="input" required={field.required} />;
      break;
    case 'number':
      input = <input id={id} type="number" name={field.name} defaultValue={String(v)} min={field.min} step={field.integer ? 1 : '0.01'} className="input" required={field.required} />;
      break;
    case 'color':
      input = <input id={id} type="color" name={field.name} defaultValue={String(v) || '#c2410c'} className="h-10 w-20 cursor-pointer rounded border border-stone-300" />;
      break;
    case 'select':
      input = <select id={id} name={field.name} defaultValue={String(v)} className="input">{field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
      break;
    default:
      input = <input id={id} type={field.type === 'url' ? 'url' : field.type === 'tel' ? 'tel' : 'text'} name={field.name} defaultValue={String(v)} maxLength={field.max} className="input" required={field.required} />;
  }

  return (
    <div>
      <label htmlFor={id} className="label">{field.label}{field.required && <span className="text-red-600"> *</span>}</label>
      {input}
      {field.help && <p className="mt-1 text-xs text-stone-500">{field.help}</p>}
    </div>
  );
}
