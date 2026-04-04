function PrivacyConsent({ checked, onChange, onOpenPrivacy }) {
  return (
    <div className="privacy-consent-section">
      <label className="privacy-consent-checkbox">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className="checkbox-custom" aria-hidden="true" />
        <span>Aceito receber novidades do mandato da Bancada Feminista</span>
      </label>

      <p className="privacy-consent-text">
        Ao enviar o formulário, você confirma que está de acordo com nossa{' '}
        <button
          type="button"
          className="privacy-consent-link"
          onClick={onOpenPrivacy}
        >
          política de privacidade
        </button>
      </p>
    </div>
  )
}

export default PrivacyConsent
