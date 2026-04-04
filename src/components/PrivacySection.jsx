import ModalPortal from './ModalPortal'

function PrivacySection({ isOpen, privacyPolicy, onClose }) {
  if (!isOpen) {
    return null
  }

  return (
    <ModalPortal>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(event) => event.stopPropagation()}>
          <button type="button" className="close" aria-label="Fechar modal" onClick={onClose}>
            ✕
          </button>

          <h2>Politica de Privacidade</h2>
          <p>{privacyPolicy}</p>
        </div>
      </div>
    </ModalPortal>
  )
}

export default PrivacySection