import { useMemo, useState } from 'preact/hooks';
import type { Prompt } from '../lib/types';
import { extractVariables, fillVariables } from '../lib/variables';

interface VariableModalProps {
  prompt: Prompt;
  action: 'insert' | 'copy';
  onConfirm: (text: string) => void;
  onCancel: () => void;
}

export function VariableModal({ prompt, action, onConfirm, onCancel }: VariableModalProps) {
  const variables = useMemo(() => extractVariables(prompt.body), [prompt.body]);
  const [values, setValues] = useState<Record<string, string>>({});
  const { text, missing } = fillVariables(prompt.body, values);

  return (
    <div
      class="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        class="modal"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onConfirm(text);
          }
        }}
      >
        <h3>{prompt.title}</h3>
        <p class="modal-sub">Fill in the variables:</p>
        {variables.map((name, i) => (
          <label key={name} class="field">
            <span>{name}</span>
            <input
              autofocus={i === 0}
              value={values[name] ?? ''}
              onInput={(e) => setValues({ ...values, [name]: e.currentTarget.value })}
            />
          </label>
        ))}
        <div class="preview">{text}</div>
        {missing.length > 0 && (
          <div class="warn">
            Empty: {missing.join(', ')} — their {'{{placeholders}}'} will be kept in the text.
          </div>
        )}
        <footer class="modal-foot">
          <button class="btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button class="btn-primary" onClick={() => onConfirm(text)}>
            {action === 'insert' ? 'Insert' : 'Copy'}
          </button>
        </footer>
      </div>
    </div>
  );
}
