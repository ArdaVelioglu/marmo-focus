// In-app Privacy Policy, Terms of Use and Acknowledgements (same text as the published web pages).
import { useEffect, useState } from 'react';
import { Sheet } from './ui';
import { ACKNOWLEDGEMENTS, APP_NAME, DEVELOPER, EFFECTIVE_DATE, PRIVACY, TERMS } from '../legal/content';
import { language, t } from '../i18n';

const DOCS = { privacy: PRIVACY, terms: TERMS };

export default function LegalSheet({ doc, onClose }) {
  const open = Boolean(doc);
  const title = doc === 'licenses' ? t('Acknowledgements') : doc ? t(DOCS[doc].title) : '';
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      {open && (
        <div className="px-5 pb-4">
          {language() !== 'en' && <p className="t-footnote text-label2 mb-3">{t('Legal documents are provided in English.')}</p>}
          {doc === 'licenses' ? <Licenses /> : <Doc d={DOCS[doc]} />}
        </div>
      )}
    </Sheet>
  );
}

function Doc({ d }) {
  return (
    <article className="t-subhead" lang="en">
      <p className="t-footnote text-label2">{APP_NAME} · {DEVELOPER} · Effective {EFFECTIVE_DATE}</p>
      <p className="card !rounded-[18px] p-4 mt-3">{d.intro}</p>
      {d.sections.map((s) => (
        <section key={s.h} className="mt-5">
          <h3 className="t-headline">{s.h}</h3>
          {s.p.map((p, i) => <p key={i} className="mt-1.5 text-label2 leading-relaxed">{p}</p>)}
        </section>
      ))}
    </article>
  );
}

function Licenses() {
  const [text, setText] = useState('');
  useEffect(() => {
    fetch('/legal/licenses.txt').then((r) => (r.ok ? r.text() : '')).then(setText).catch(() => setText(''));
  }, []);
  return (
    <div lang="en">
      <ul className="card !rounded-[18px] overflow-hidden">
        {ACKNOWLEDGEMENTS.map((a, i) => (
          <li key={a.name} className={`px-4 py-3 ${i < ACKNOWLEDGEMENTS.length - 1 ? 'hairline-b' : ''}`}>
            <p className="t-subhead font-semibold">{a.name}</p>
            <p className="t-footnote text-label2">{a.license} · {a.by}</p>
          </li>
        ))}
      </ul>
      <p className="t-footnote text-label2 mt-4">{t('Artwork, characters and music in this app are original and belong to the developer.')}</p>
      {text && <pre className="mt-4 whitespace-pre-wrap break-words text-[11px] leading-snug text-label2 font-mono">{text}</pre>}
    </div>
  );
}
