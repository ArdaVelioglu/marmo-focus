// Last-resort screen if something throws while rendering, instead of a blank page.
// Offers a reload, a copy of the saved data, and a reset, so a bad save can never lock someone out.
import { Component } from 'react';
import { t } from '../i18n';
import { exportData } from '../lib/exportData';

const KEY = 'marmo-focus:v1';

export default class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('Marmo Focus crashed', error, info?.componentStack); }

  render() {
    if (!this.state.error) return this.props.children;
    const saved = (() => { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } })();
    const btn = 'w-full h-[52px] rounded-[18px] t-headline mt-3';
    return (
      <div className="min-h-dvh grid place-items-center p-6 text-center">
        <div className="max-w-[360px] w-full">
          <p className="t-title2">{t('Something went wrong')}</p>
          <p className="t-subhead text-label2 mt-2">{t('Try reloading. If it keeps happening, save a copy of your data and reset the app.')}</p>
          <button className={`${btn} btn-tint`} onClick={() => window.location.reload()}>{t('Reload')}</button>
          {saved && <button className={`${btn} bg-fill2`} onClick={() => exportData(saved)}>{t('Export My Data')}</button>}
          <button className={`${btn} text-danger`} onClick={() => { try { localStorage.removeItem(KEY); } catch { /* unavailable */ } window.location.reload(); }}>{t('Reset App')}</button>
        </div>
      </div>
    );
  }
}
